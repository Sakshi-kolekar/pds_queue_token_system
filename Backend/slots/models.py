from django.db import models
from counters.models import Counter


class Slot(models.Model):

    class Status(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Available"
        FULL = "FULL", "Full"
        CLOSED = "CLOSED", "Closed"

    counter = models.ForeignKey(
        Counter,
        on_delete=models.CASCADE,
        related_name="slots"
    )

    slot_date = models.DateField()

    start_time = models.TimeField()

    end_time = models.TimeField()

    max_tokens = models.PositiveIntegerField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.counter.counter_no} - {self.slot_date} ({self.start_time}-{self.end_time})"

