from rest_framework import serializers
from .models import Slot


class SlotSerializer(serializers.ModelSerializer):
    counter_no = serializers.CharField(
        source="counter.counter_no",
        read_only=True
    )

    class Meta:
        model = Slot
        fields = [
            "id",
            "counter",
            "counter_no",
            "slot_date",
            "start_time",
            "end_time",
            "max_tokens",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_max_tokens(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Maximum tokens must be greater than zero."
            )
        return value

    def validate(self, attrs):
        start_time = attrs.get(
            "start_time",
            getattr(self.instance, "start_time", None)
        )
        end_time = attrs.get(
            "end_time",
            getattr(self.instance, "end_time", None)
        )

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError({
                "end_time": "End time must be later than start time."
            })

        return attrs