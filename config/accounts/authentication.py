from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
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