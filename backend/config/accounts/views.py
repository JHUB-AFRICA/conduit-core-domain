from datetime import timedelta

from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, APIKey, APIRequestLog
from .serializers import (
    SignupSerializer,
    LoginSerializer,
    UserSerializer,
    APIKeySerializer,
    APIUsageSerializer,
)


class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class APIKeyCreateView(generics.CreateAPIView):
    serializer_class = APIKeySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class APIKeyListView(generics.ListAPIView):
    serializer_class = APIKeySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return APIKey.objects.filter(user=self.request.user)


class APIKeyDeleteView(generics.DestroyAPIView):
    serializer_class = APIKeySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return APIKey.objects.filter(user=self.request.user)


class APIUsageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            api_key = APIKey.objects.get(user=request.user, is_active=True)
        except APIKey.DoesNotExist:
            return Response({"detail": "No active API key found."}, status=404)

        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        one_minute_ago = now - timedelta(minutes=1)

        requests_today = APIRequestLog.objects.filter(
            api_key=api_key,
            created_at__gte=today_start,
        ).count()

        requests_this_minute = APIRequestLog.objects.filter(
            api_key=api_key,
            created_at__gte=one_minute_ago,
        ).count()

        total_requests = APIRequestLog.objects.filter(api_key=api_key).count()

        data = {
            "daily_quota": api_key.daily_quota,
            "requests_today": requests_today,
            "requests_remaining": max(api_key.daily_quota - requests_today, 0),
            "requests_per_minute": api_key.requests_per_minute,
            "requests_this_minute": requests_this_minute,
            "total_requests": total_requests,
        }

        serializer = APIUsageSerializer(data)
        return Response(serializer.data)