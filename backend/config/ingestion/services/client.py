"""
Thin client for the 3D-FEWSNET CHORDS API.

Credentials come from Django settings (loaded from .env).

Supports two request modes:

1. Historical / backfill
   start=YYYY-MM-DD
   end=YYYY-MM-DD

2. Live sync
   start=YYYY-MM-DD
   (no end parameter)

When the end parameter is omitted, the FEWSNET API returns readings up
to the most recent available measurement.
"""

import requests
from django.conf import settings


class FewsnetError(Exception):
    """Raised when the external API can't be reached or returns something unusable."""


def fetch_station_properties(start_date, end_date=None):
    """
    Fetch one date-range window for the configured weather station.

    Parameters
    ----------
    start_date : date
        First day to request.

    end_date : date | None
        Last day to request.

        If None, the FEWSNET API's default behaviour is used, which
        returns data from start_date up to the latest available reading.

    Returns
    -------
    dict | None
        The "properties" object from the GeoJSON response, or None if
        the API returned no features.
    """

    if not settings.FEWSNET_EMAIL or not settings.FEWSNET_API_KEY:
        raise FewsnetError(
            "FEWSNET_EMAIL / FEWSNET_API_KEY are not set. "
            "Check your .env file."
        )

    params = {
        "email": settings.FEWSNET_EMAIL,
        "api_key": settings.FEWSNET_API_KEY,
        "instruments": settings.FEWSNET_SENSOR_ID,
        "start": start_date.isoformat(),
    }

    # Only include "end" when explicitly requested.
    # Omitting it allows FEWSNET to return data up to "now".
    if end_date is not None:
        params["end"] = end_date.isoformat()

    try:
        response = requests.get(
            settings.FEWSNET_API_BASE_URL,
            params=params,
            timeout=60,
        )
        response.raise_for_status()

    except requests.RequestException as exc:
        raise FewsnetError(
            f"Request to 3D-FEWSNET API failed: {exc}"
        ) from exc

    try:
        payload = response.json()

    except ValueError as exc:
        raise FewsnetError(
            "3D-FEWSNET API did not return valid JSON."
        ) from exc

    features = payload.get("features", [])

    if not features:
        return None

    return features[0].get("properties", {})