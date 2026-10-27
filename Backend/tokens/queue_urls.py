from django.urls import path

from .queue_views import LiveQueueAPIView

urlpatterns = [
    path("live/", LiveQueueAPIView.as_view(), name="queue-live"),
]