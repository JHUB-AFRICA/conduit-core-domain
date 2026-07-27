from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils import timezone
from datetime import timedelta

from .models import APIKey, APIRequestLog

class APIKeyAuthentication(BaseAuthentication):

    def authenticate(self, request):

        key_value = request.headers.get("X-API-KEY")

        if not key_value:
            return None

        try:
            api_key = APIKey.objects.get(key=key_value, is_active=True)
        except APIKey.DoesNotExist:
            raise AuthenticationFailed("Invalid API key")

        #RATE LIMIT CHECK

        now = timezone.now()

        # 1. per-minute limit
        one_minute_ago = now - timedelta(minutes=1)
        minute_count = APIRequestLog.objects.filter(
            api_key=api_key,
            created_at__gte=one_minute_ago
        ).count()

        if minute_count >= api_key.requests_per_minute:
            raise AuthenticationFailed("Rate limit exceeded (per minute)")

        # 2. daily limit
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        daily_count = APIRequestLog.objects.filter(
            api_key=api_key,
            created_at__gte=today_start
        ).count()

        if daily_count >= api_key.daily_quota:
            raise AuthenticationFailed("Daily quota exceeded")

        # log request
        APIRequestLog.objects.create(
            api_key=api_key,
            endpoint=request.path
        )

        return (api_key.user, api_key)


class JWTOrAPIKeyAuthentication(BaseAuthentication):
    """
    For endpoints that are hit both by the logged-in website (Data Portal,
    Alerts page, etc.) and by external API consumers with their own key.

    A valid JWT — the session the browser already holds from /auth/login/ —
    authenticates for free and never touches APIRequestLog, because from the
    product's point of view that's just someone using the website, not an
    "API call". A request has to be authenticating with X-API-KEY alone
    (no usable session) to be treated as external API usage and metered
    against that key's rate limit / daily quota, exactly as before.

    If a JWT is present but invalid/expired, we don't hard-fail here — we
    fall back to the API key, if any, so a stale browser session doesn't
    break a request that would otherwise succeed on the key.
    """

    def authenticate(self, request):
        try:
            result = JWTAuthentication().authenticate(request)
        except AuthenticationFailed:
            result = None

        if result is not None:
            return result

        return APIKeyAuthentication().authenticate(request)

    def authenticate_header(self, request):
        return "Bearer"