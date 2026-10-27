from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_date

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from audit_logs.models import AuditLog
from users.permissions import IsStaffOrAdmin
from .models import Token


def queue_row(token):
    """Minimal token info. No personal data, safe to show to customers."""
    return {
        "id": token.id,
        "token_no": token.token_no,
        "status": token.status,
        "counter_no": token.slot.counter.counter_no,
        "counter_name": token.slot.counter.name,
    }


class LiveQueueAPIView(APIView):
    """
    Live queue for one day (default: today).
    Optional filters: ?date=YYYY-MM-DD and ?counter=<counter id>
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_value = request.query_params.get("date")

        if date_value:
            queue_date = parse_date(date_value)
            if queue_date is None:
                return Response(
                    {"detail": "Invalid date. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            queue_date = timezone.localdate()

        tokens = Token.objects.filter(
            token_date=queue_date
        ).select_related("slot__counter")

        counter_id = request.query_params.get("counter")
        if counter_id:
            tokens = tokens.filter(slot__counter_id=counter_id)

        now_serving = tokens.filter(
            status=Token.Status.CALLED
        ).order_by("called_at")

        waiting = tokens.filter(
            status=Token.Status.WAITING
        ).order_by("id")

        recently_served = tokens.filter(
            status=Token.Status.SERVED
        ).order_by("-served_at")[:5]

        missed = tokens.filter(
            status=Token.Status.MISSED
        ).order_by("-missed_at")

        return Response(
            {
                "date": str(queue_date),
                "counts": {
                    "waiting": waiting.count(),
                    "now_serving": now_serving.count(),
                    "served": tokens.filter(
                        status=Token.Status.SERVED
                    ).count(),
                    "missed": missed.count(),
                },
                "now_serving": [queue_row(t) for t in now_serving],
                "waiting": [queue_row(t) for t in waiting],
                "recently_served": [queue_row(t) for t in recently_served],
                "missed": [queue_row(t) for t in missed],
            },
            status=status.HTTP_200_OK,
        )


class TokenHistoryAPIView(APIView):
    """Full status history of one token, built from the audit log."""

    permission_classes = [IsStaffOrAdmin]

    def get(self, request, pk):
        token = get_object_or_404(Token, pk=pk)

        logs = AuditLog.objects.filter(
            entity_name="Token",
            entity_id=token.pk,
        ).select_related("user").order_by("created_at")

        history = [
            {
                "action": log.action,
                "done_by": log.user.username if log.user else None,
                "details": log.details,
                "at": log.created_at,
            }
            for log in logs
        ]

        return Response(
            {
                "token_no": token.token_no,
                "current_status": token.status,
                "history": history,
            },
            status=status.HTTP_200_OK,
        )