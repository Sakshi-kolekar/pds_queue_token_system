from django.conf import settings
from django.db import models

from beneficiaries.models import Beneficiary
from slots.models import Slot


class Token(models.Model):

    class Status(models.TextChoices):
        WAITING = "WAITING", "Waiting"
        CALLED = "CALLED", "Called"
        SERVED = "SERVED", "Served"
        MISSED = "MISSED", "Missed"
        CANCELLED = "CANCELLED", "Cancelled"

    token_no = models.CharField(max_length=10)
    token_date = models.DateField()

    # PROTECT: a beneficiary or slot with tokens cannot be deleted,
    # so token history is never lost.
    beneficiary = models.ForeignKey(
        Beneficiary,
        on_delete=models.PROTECT,
        related_name="tokens"
    )

    slot = models.ForeignKey(
        Slot,
        on_delete=models.PROTECT,
        related_name="tokens"
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.WAITING
    )

    missed_count = models.PositiveIntegerField(default=0)

    generated_at = models.DateTimeField(auto_now_add=True)
    called_at = models.DateTimeField(null=True, blank=True)
    served_at = models.DateTimeField(null=True, blank=True)
    missed_at = models.DateTimeField(null=True, blank=True)

    served_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="served_tokens"
    )

    remarks = models.TextField(null=True, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_tokens"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # The same token number cannot repeat on the same date
        unique_together = ("token_date", "token_no")
        indexes = [
            models.Index(fields=["token_date", "status"]),
        ]

    def __str__(self):
        return self.token_no
