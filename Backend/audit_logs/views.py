from rest_framework import generics

from users.permissions import IsStaffOrAdmin
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(generics.ListAPIView):
    """ADMIN sees every action. STAFF sees token actions only."""

    serializer_class = AuditLogSerializer
    permission_classes = [IsStaffOrAdmin]

    def get_queryset(self):
        queryset = AuditLog.objects.select_related("user").all()

        if self.request.user.role != "ADMIN":
            queryset = queryset.filter(entity_name="Token")

        action = self.request.query_params.get("action")
        entity_name = self.request.query_params.get("entity_name")

        if action:
            queryset = queryset.filter(action=action)

        if entity_name:
            queryset = queryset.filter(entity_name=entity_name)

        return queryset.order_by("-created_at")