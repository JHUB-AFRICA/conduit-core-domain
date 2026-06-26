from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    SignupView,
    LoginView,
    MeView,
    APIKeyListView,
    APIKeyCreateView,
    APIKeyDeleteView,
)

urlpatterns = [
    # Authentication
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("me/", MeView.as_view(), name="me"),

    # API Keys
    path("api-keys/", APIKeyListView.as_view(), name="api-key-list"),
    path("api-keys/create/", APIKeyCreateView.as_view(), name="api-key-create"),
    path("api-keys/<int:pk>/", APIKeyDeleteView.as_view(), name="api-key-delete"),
]