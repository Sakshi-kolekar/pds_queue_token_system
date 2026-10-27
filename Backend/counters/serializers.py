
from rest_framework import serializers
from .models import Counter


class CounterSerializer(serializers.ModelSerializer):
    operator_username = serializers.CharField(
        source="operator.username",
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = Counter
        fields = [
            "id",
            "counter_no",
            "name",
            "status",
            "operator",
            "operator_username",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]