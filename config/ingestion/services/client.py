"""
Thin client for the 3D-FEWSNET CHORDS API. Credentials come from
settings (loaded from .env) — nothing here is hardcoded.
"""

import requests
from django.conf import settings


class FewsnetError(Exception):
    """Raised when the external API can't be reached or returns something unusable."""


def fetch_station_properties(start_date, end_date):
    """
    Fetch one date-range window for the configured sensor.
    Returns the "properties" dict (containing "data": [...]) or None if
    the API returned no features for this window.
    """
    if not settings.FEWSNET_EMAIL or not settings.FEWSNET_API_KEY:
        raise FewsnetError(
            "FEWSNET_EMAIL / FEWSNET_API_KEY are not set — check your .env file."
        )

    params = {
        "email": settings.FEWSNET_EMAIL,
        "api_key": settings.FEWSNET_API_KEY,
        "instruments": settings.FEWSNET_SENSOR_ID,
        "start": start_date.isoformat(),
        "end": end_date.isoformat(),
    }

    try:
        resp = requests.get(settings.FEWSNET_API_BASE_URL, params=params, timeout=60)
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise FewsnetError(f"Request to 3D-FEWSNET API failed: {exc}") from exc

    try:
        payload = resp.json()
    except ValueError as exc:
        raise FewsnetError("3D-FEWSNET API did not return valid JSON") from exc

    features = payload.get("features", [])
    if not features:
        return None

    return features[0].get("properties", {})
