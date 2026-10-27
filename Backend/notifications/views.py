
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationReadSerializer, NotificationSerializer


def visible_notifications(user):
    queryset = Notification.objects.select_related("beneficiary", "token")

    if user.role == "ADMIN":
        return queryset.order_by("-created_at")

    if user.role == "STAFF":
        return queryset.filter(
            token__isnull=False
        ).order_by("-created_at")

    profile = getattr(user, "beneficiary_profile", None)

    if profile is None:
        return Notification.objects.none()

    return queryset.filter(
        beneficiary=profile
    ).order_by("-created_at")


class NotificationListCreateView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = visible_notifications(self.request.user)

        is_read = self.request.query_params.get("is_read")
        notification_type = self.request.query_params.get("type")

        if is_read in ("true", "false"):
            queryset = queryset.filter(is_read=(is_read == "true"))

        if notification_type:
            queryset = queryset.filter(type=notification_type)

        return queryset

    def perform_create(self, serializer):
        if self.request.user.role not in ("ADMIN", "STAFF"):
            raise PermissionDenied(
                "You are not allowed to create notifications."
            )
        serializer.save()


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return visible_notifications(self.request.user)

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return NotificationReadSerializer
        return NotificationSerializer
