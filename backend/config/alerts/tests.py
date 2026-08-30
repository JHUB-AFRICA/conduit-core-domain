import hashlib
import hmac
import json
from datetime import timedelta
from unittest.mock import Mock, patch

from django.test import TestCase
from django.utils import timezone

from accounts.models import User
from alerts.models import Alert, WebhookDelivery, WebhookEvent, WebhookSubscription
from alerts.services.hydrology import evaluate_station_hydrology
from alerts.services.livestock import evaluate_livestock_thermal
from alerts.services.webhooks import retry_failed_deliveries
from telemetry.models import WeatherMeasurement, WeatherStation


class HydrologyServiceTests(TestCase):
    def setUp(self):
        self.station = WeatherStation.objects.create(
            instrument_name="Test Station", sensor_id=9001, slug="test-station-hydro"
        )
        self.now = timezone.now()

    def _add_measurement(self, hours_ago, **fields):
        WeatherMeasurement.objects.create(
            station=self.station, time=self.now - timedelta(hours=hours_ago), **fields
        )

    def test_heavy_rain_and_falling_pressure_creates_extreme_alert(self):
        for i in range(6):
            self._add_measurement(
                hours_ago=5 - i,
                rain_gauge_1=8.0,  # 6 * 8mm = 48mm -> top rainfall band
                rain_gauge_2=2.0,
                bmx_pressure=1015.0 - i,  # falling
            )

        result = evaluate_station_hydrology(self.station, reference_time=self.now)

        self.assertEqual(result["runoff_risk_score"], 100)
        self.assertEqual(result["severity"], Alert.Severity.EXTREME)
        self.assertEqual(result["recommendation"], "Do not apply fertilizer")
        self.assertEqual(result["pressure_trend"], Alert.PressureTrend.FALLING)
        self.assertIsNotNone(result["alert"])
        self.assertEqual(result["alert"].alert_type, Alert.AlertType.HYDROLOGY)

    def test_zero_rainfall_and_rising_pressure_scores_zero(self):
        for i in range(3):
            self._add_measurement(
                hours_ago=2 - i, rain_gauge_1=0.0, rain_gauge_2=0.0, bmx_pressure=1010.0 + i * 2.0
            )

        result = evaluate_station_hydrology(self.station, reference_time=self.now)

        self.assertEqual(result["runoff_risk_score"], 0)
        self.assertEqual(result["pressure_trend"], Alert.PressureTrend.RISING)
        self.assertEqual(result["severity"], Alert.Severity.LOW)
        self.assertIsNone(result["alert"])

    def test_steady_pressure_contributes_baseline_score(self):
        for i in range(3):
            self._add_measurement(hours_ago=2 - i, rain_gauge_1=0.0, rain_gauge_2=0.0, bmx_pressure=1010.0)

        result = evaluate_station_hydrology(self.station, reference_time=self.now)

        self.assertEqual(result["pressure_trend"], Alert.PressureTrend.STEADY)
        self.assertEqual(result["runoff_risk_score"], 10)

    def test_repeated_high_risk_does_not_duplicate_alert(self):
        for i in range(6):
            self._add_measurement(
                hours_ago=5 - i, rain_gauge_1=8.0, rain_gauge_2=2.0, bmx_pressure=1015.0 - i
            )

        evaluate_station_hydrology(self.station, reference_time=self.now)
        evaluate_station_hydrology(self.station, reference_time=self.now)

        active_count = Alert.objects.filter(
            station=self.station, alert_type=Alert.AlertType.HYDROLOGY, is_active=True
        ).count()
        self.assertEqual(active_count, 1)

    def test_risk_dropping_resolves_active_alert(self):
        for i in range(6):
            self._add_measurement(
                hours_ago=5 - i, rain_gauge_1=8.0, rain_gauge_2=2.0, bmx_pressure=1015.0 - i
            )
        evaluate_station_hydrology(self.station, reference_time=self.now)

        WeatherMeasurement.objects.filter(station=self.station).delete()
        for i in range(3):
            self._add_measurement(hours_ago=2 - i, rain_gauge_1=0.0, rain_gauge_2=0.0, bmx_pressure=1010.0)
        evaluate_station_hydrology(self.station, reference_time=self.now)

        resolved = Alert.objects.filter(
            station=self.station, alert_type=Alert.AlertType.HYDROLOGY, is_active=False
        )
        self.assertEqual(resolved.count(), 1)
        self.assertIsNotNone(resolved.first().resolved_at)


class LivestockServiceTests(TestCase):
    def setUp(self):
        self.station = WeatherStation.objects.create(
            instrument_name="Test Station", sensor_id=9002, slug="test-station-livestock"
        )
        self.now = timezone.now()

    def test_crossing_threshold_creates_alert_and_coalesces_while_above(self):
        m1 = WeatherMeasurement.objects.create(station=self.station, time=self.now, wbgt=20.0)
        m2 = WeatherMeasurement.objects.create(
            station=self.station, time=self.now + timedelta(minutes=5), wbgt=25.0
        )
        m3 = WeatherMeasurement.objects.create(
            station=self.station, time=self.now + timedelta(minutes=10), wbgt=26.0
        )

        created = evaluate_livestock_thermal([m1, m2, m3], threshold=22.0)

        self.assertEqual(len(created), 1)
        self.assertEqual(created[0].severity, Alert.Severity.HIGH)
        self.assertEqual(
            Alert.objects.filter(station=self.station, alert_type=Alert.AlertType.LIVESTOCK).count(), 1
        )

    def test_drop_below_then_recross_creates_second_alert(self):
        m1 = WeatherMeasurement.objects.create(station=self.station, time=self.now, wbgt=25.0)
        m2 = WeatherMeasurement.objects.create(
            station=self.station, time=self.now + timedelta(minutes=5), wbgt=21.0
        )
        m3 = WeatherMeasurement.objects.create(
            station=self.station, time=self.now + timedelta(minutes=10), wbgt=29.0
        )

        created = evaluate_livestock_thermal([m1, m2, m3], threshold=22.0)

        self.assertEqual(len(created), 2)
        self.assertEqual(created[1].severity, Alert.Severity.EXTREME)
        alerts = Alert.objects.filter(station=self.station, alert_type=Alert.AlertType.LIVESTOCK).order_by(
            "created_at"
        )
        self.assertEqual([a.is_active for a in alerts], [False, True])

    def test_measurements_without_wbgt_are_skipped(self):
        m1 = WeatherMeasurement.objects.create(station=self.station, time=self.now, wbgt=None)
        created = evaluate_livestock_thermal([m1], threshold=22.0)
        self.assertEqual(created, [])


class WebhookServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="hooks@example.com", username="hooksuser", password="pw", is_active=True
        )
        self.station = WeatherStation.objects.create(
            instrument_name="Test Station", sensor_id=9003, slug="test-station-webhooks"
        )
        self.now = timezone.now()

    def _mock_response(self, status_code):
        response = Mock()
        response.status_code = status_code
        return response

    @patch("alerts.services.webhooks.requests.post")
    def test_matching_subscription_receives_signed_payload_on_create(self, mock_post):
        mock_post.return_value = self._mock_response(200)
        subscription = WebhookSubscription.objects.create(user=self.user, url="https://example.com/hook")

        for i in range(6):
            WeatherMeasurement.objects.create(
                station=self.station,
                time=self.now - timedelta(hours=5 - i),
                rain_gauge_1=8.0,
                rain_gauge_2=2.0,
                bmx_pressure=1015.0 - i,
            )
        evaluate_station_hydrology(self.station, reference_time=self.now)

        self.assertEqual(mock_post.call_count, 1)
        _, kwargs = mock_post.call_args
        sent_body = kwargs["data"]
        payload = json.loads(sent_body)
        self.assertEqual(payload["event"], WebhookEvent.ALERT_CREATED)
        self.assertEqual(payload["alert"]["alert_type"], Alert.AlertType.HYDROLOGY)

        expected_signature = (
            "sha256=" + hmac.new(subscription.secret.encode(), sent_body, hashlib.sha256).hexdigest()
        )
        self.assertEqual(kwargs["headers"]["X-Conduit-Signature"], expected_signature)

        delivery = WebhookDelivery.objects.get(subscription=subscription)
        self.assertTrue(delivery.success)
        self.assertEqual(delivery.response_status, 200)

    @patch("alerts.services.webhooks.requests.post")
    def test_subscription_filtered_by_alert_type_is_not_notified(self, mock_post):
        mock_post.return_value = self._mock_response(200)
        WebhookSubscription.objects.create(
            user=self.user, url="https://example.com/hook", alert_type=Alert.AlertType.LIVESTOCK
        )

        for i in range(6):
            WeatherMeasurement.objects.create(
                station=self.station,
                time=self.now - timedelta(hours=5 - i),
                rain_gauge_1=8.0,
                rain_gauge_2=2.0,
                bmx_pressure=1015.0 - i,
            )
        evaluate_station_hydrology(self.station, reference_time=self.now)

        mock_post.assert_not_called()

    @patch("alerts.services.webhooks.requests.post")
    def test_failed_delivery_is_logged_not_raised(self, mock_post):
        mock_post.return_value = self._mock_response(500)
        WebhookSubscription.objects.create(user=self.user, url="https://example.com/hook")

        measurement = WeatherMeasurement.objects.create(station=self.station, time=self.now, wbgt=30.0)
        # Should not raise even though the subscriber returns a server error.
        evaluate_livestock_thermal([measurement], threshold=22.0)

        delivery = WebhookDelivery.objects.get()
        self.assertFalse(delivery.success)
        self.assertEqual(delivery.response_status, 500)
        self.assertEqual(delivery.attempt_count, 1)

    @patch("alerts.services.webhooks.requests.post")
    def test_retry_failed_deliveries_increments_attempt_count(self, mock_post):
        mock_post.return_value = self._mock_response(500)
        WebhookSubscription.objects.create(user=self.user, url="https://example.com/hook")
        measurement = WeatherMeasurement.objects.create(station=self.station, time=self.now, wbgt=30.0)
        evaluate_livestock_thermal([measurement], threshold=22.0)

        result = retry_failed_deliveries()

        self.assertEqual(result, {"retried": 1, "succeeded": 0})
        self.assertEqual(WebhookDelivery.objects.count(), 2)
        latest = WebhookDelivery.objects.order_by("-created_at").first()
        self.assertEqual(latest.attempt_count, 2)

    @patch("alerts.services.webhooks.requests.post")
    def test_resolved_alert_fires_separate_event(self, mock_post):
        mock_post.return_value = self._mock_response(200)
        WebhookSubscription.objects.create(user=self.user, url="https://example.com/hook")

        for i in range(6):
            WeatherMeasurement.objects.create(
                station=self.station,
                time=self.now - timedelta(hours=5 - i),
                rain_gauge_1=8.0,
                rain_gauge_2=2.0,
                bmx_pressure=1015.0 - i,
            )
        evaluate_station_hydrology(self.station, reference_time=self.now)

        WeatherMeasurement.objects.filter(station=self.station).delete()
        for i in range(3):
            WeatherMeasurement.objects.create(
                station=self.station,
                time=self.now - timedelta(hours=2 - i),
                rain_gauge_1=0.0,
                rain_gauge_2=0.0,
                bmx_pressure=1010.0 + i * 2,
            )
        evaluate_station_hydrology(self.station, reference_time=self.now)

        events = list(WebhookDelivery.objects.order_by("created_at").values_list("event_type", flat=True))
        self.assertEqual(events, [WebhookEvent.ALERT_CREATED, WebhookEvent.ALERT_RESOLVED])
