from rest_framework import serializers

from .models import Notification

FIELDS = [
    "id",
    "beneficiary",
    "beneficiary_name",
    "token",
    "token_no",
    "type",
    "message",
    "is_read",
    "created_at",
]


class NotificationSerializer(serializers.ModelSerializer):
    token_no = serializers.CharField(source="token.token_no", read_only=True)
    beneficiary_name = serializers.CharField(
        source="beneficiary.full_name", read_only=True
    )

    class Meta:
        model = Notification
        fields = FIELDS
        read_only_fields = ["id", "created_at"]


class NotificationReadSerializer(serializers.ModelSerializer):
    """Used for updates: only is_read can be changed."""

    token_no = serializers.CharField(source="token.token_no", read_only=True)
    beneficiary_name = serializers.CharField(
        source="beneficiary.full_name", read_only=True
    )

    class Meta:
        model = Notification
        fields = FIELDS
        read_only_fields = [
            "id",
            "beneficiary",
            "token",
            "type",
            "message",
            "created_at",
        ]