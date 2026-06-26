from .models import User, APIKey
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    SignupSerializer,
    LoginSerializer,
    UserSerializer,
    APIKeySerializer
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
    




class APIKeyCreateView(
    generics.CreateAPIView
):
    serializer_class = APIKeySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )

class APIKeyListView(
    generics.ListAPIView
):
    serializer_class = APIKeySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return APIKey.objects.filter(
            user=self.request.user
        )
    
class APIKeyDeleteView(
    generics.DestroyAPIView
):
    serializer_class = APIKeySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return APIKey.objects.filter(
            user=self.request.user
        )