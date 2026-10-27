from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from audit_logs.models import AuditLog
from notifications.models import Notification
from notifications.services import notify_token_event
from slots.models import Slot
from users.permissions import IsStaffOrAdmin
from .models import Token
from .serializers import TokenSerializer


# Which notification is created for each workflow action
ACTION_NOTIFICATION = {
    "call": Notification.Type.TOKEN_CALLED,
    "serve": Notification.Type.TOKEN_SERVED,
    "missed": Notification.Type.TOKEN_MISSED,
}


class TokenListCreateAPIView(generics.ListCreateAPIView):
    """List tokens (with filters) and generate a new token."""

    serializer_class = TokenSerializer
    permission_classes = [IsStaffOrAdmin]

    def get_queryset(self):
        queryset = Token.objects.select_related(
            "beneficiary",
            "slot",
            "served_by",
            "created_by",
        ).all()

        token_date = self.request.query_params.get("token_date")
        token_status = self.request.query_params.get("status")
        beneficiary_id = self.request.query_params.get("beneficiary")

        if token_date:
            queryset = queryset.filter(token_date=token_date)

        if token_status:
            queryset = queryset.filter(status=token_status)

        if beneficiary_id:
            queryset = queryset.filter(beneficiary_id=beneficiary_id)

        return queryset.order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user

        if not user.is_active:
            raise ValidationError("Inactive users cannot generate tokens.")

        try:
            with transaction.atomic():
                # Lock the slot row so two requests cannot exceed capacity
                slot = Slot.objects.select_for_update().get(
                    pk=serializer.validated_data["slot"].pk
                )

                if slot.status != Slot.Status.AVAILABLE:
                    raise ValidationError("Selected slot is not available.")

                active_count = Token.objects.filter(
                    slot=slot
                ).exclude(
                    status=Token.Status.CANCELLED
                ).count()

                if active_count >= slot.max_tokens:
                    raise ValidationError(
                        "Selected slot has reached its capacity."
                    )

                # Token date comes from the slot.
                # Token number is the next number of that day.
                token_date = slot.slot_date
                day_count = Token.objects.filter(
                    token_date=token_date
                ).count()
                token_no = f"T-{day_count + 1:03d}"

                token = serializer.save(
                    token_date=token_date,
                    token_no=token_no,
                    created_by=user,
                    status=Token.Status.WAITING,
                )

                AuditLog.objects.create(
                    user=user,
                    action="CREATE",
                    entity_name="Token",
                    entity_id=token.id,
                    details={
                        "token_no": token.token_no,
                        "status": token.status,
                        "beneficiary_id": token.beneficiary_id,
                    },
                )

                notify_token_event(token, Notification.Type.TOKEN_GENERATED)
        except IntegrityError:
            # Two requests got the same number at the same moment
            raise ValidationError("Token number conflict. Please try again.")


class TokenDetailAPIView(generics.RetrieveAPIView):
    """Read-only token detail. Edit and delete are not allowed."""

    queryset = Token.objects.select_related(
        "beneficiary",
        "slot",
        "served_by",
        "created_by",
    ).all()

    serializer_class = TokenSerializer
    permission_classes = [IsStaffOrAdmin]


class TokenWorkflowAPIView(APIView):
    """Change token status: call, serve or missed."""

    permission_classes = [IsStaffOrAdmin]

    @transaction.atomic
    def post(self, request, pk, action):
        token = get_object_or_404(
            Token.objects.select_for_update(),
            pk=pk,
        )

        user = request.user

        if not user.is_active:
            return Response(
                {"detail": "Inactive users cannot update tokens."},
                status=status.HTTP_403_FORBIDDEN,
            )

        now = timezone.now()
        old_status = token.status

        if action == "call":
            if old_status != Token.Status.WAITING:
                return Response(
                    {"detail": "Only WAITING tokens can be called."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token.status = Token.Status.CALLED
            token.called_at = now
            message = "Token called successfully."

        elif action == "serve":
            if old_status != Token.Status.CALLED:
                return Response(
                    {"detail": "Only CALLED tokens can be served."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token.status = Token.Status.SERVED
            token.served_at = now
            token.served_by = user
            message = "Token served successfully."

        elif action == "missed":
            if old_status != Token.Status.CALLED:
                return Response(
                    {"detail": "Only CALLED tokens can be marked as missed."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token.status = Token.Status.MISSED
            token.missed_at = now
            token.missed_count += 1
            message = "Token marked as missed."

        else:
            return Response(
                {"detail": "Invalid workflow action."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token.save()

        # Audit log for the status change
        AuditLog.objects.create(
            user=user,
            action=action.upper(),
            entity_name="Token",
            entity_id=token.id,
            details={
                "token_no": token.token_no,
                "old_status": old_status,
                "new_status": token.status,
            },
        )

        # Notification for the beneficiary
        notify_token_event(token, ACTION_NOTIFICATION[action])

        return Response(
            {
                "message": message,
                "old_status": old_status,
                "new_status": token.status,
                "token": TokenSerializer(token).data,
            },
            status=status.HTTP_200_OK,
        )