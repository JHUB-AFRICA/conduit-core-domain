from django.urls import path

from .views import (
    AlertDetailView,
    AlertListView,
    InternalRetryWebhooksView,
    WebhookDeliveryListView,
    WebhookSubscriptionDetailView,
    WebhookSubscriptionListCreateView,
    WebhookSubscriptionTestView,
)

urlpatterns = [
    path("alerts/", AlertListView.as_view(), name="alert-list"),
    path("alerts/<uuid:pk>/", AlertDetailView.as_view(), name="alert-detail"),
    path("alerts/webhooks/", WebhookSubscriptionListCreateView.as_view(), name="webhook-list-create"),
    path("alerts/webhooks/<uuid:pk>/", WebhookSubscriptionDetailView.as_view(), name="webhook-detail"),
    path("alerts/webhooks/<uuid:pk>/test/", WebhookSubscriptionTestView.as_view(), name="webhook-test"),
    path(
        "alerts/webhooks/<uuid:pk>/deliveries/",
        WebhookDeliveryListView.as_view(),
        name="webhook-deliveries",
    ),
    path(
        "alerts/internal/retry-webhooks/",
        InternalRetryWebhooksView.as_view(),
        name="internal-retry-webhooks",
    ),
]
