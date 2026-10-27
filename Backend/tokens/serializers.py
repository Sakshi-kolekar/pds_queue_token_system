from rest_framework import serializers

from .models import Token


class TokenSerializer(serializers.ModelSerializer):
    beneficiary_name = serializers.CharField(
        source="beneficiary.full_name",
        read_only=True
    )
    slot_id = serializers.IntegerField(
        source="slot.id",
        read_only=True
    )

    class Meta:
        model = Token
        fields = [
            "id",
            "token_no",
            "token_date",
            "beneficiary",
            "beneficiary_name",
            "slot",
            "slot_id",
            "status",
            "missed_count",
            "generated_at",
            "called_at",
            "served_at",
            "missed_at",
            "served_by",
            "remarks",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "token_no",
            "token_date",
            "status",
            "missed_count",
            "generated_at",
            "called_at",
            "served_at",
            "missed_at",
            "served_by",
            "created_by",
            "created_at",
            "updated_at",
        ]