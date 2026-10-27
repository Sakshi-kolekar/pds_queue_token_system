from django.db import models
from beneficiaries.models import Beneficiary
from tokens.models import Token


class Notification(models.Model):

    class Type(models.TextChoices):
        TOKEN_GENERATED = "TOKEN_GENERATED", "Token Generated"
        TOKEN_CALLED = "TOKEN_CALLED", "Token Called"
        TOKEN_SERVED = "TOKEN_SERVED", "Token Served"
        TOKEN_MISSED = "TOKEN_MISSED", "Token Missed"
        TOKEN_CANCELLED = "TOKEN_CANCELLED", "Token Cancelled"

    beneficiary = models.ForeignKey(
        Beneficiary,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    token = models.ForeignKey(
        Token,
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True
    )

    type = models.CharField(
        max_length=30,
        choices=Type.choices
    )

    message = models.CharField(max_length=255)

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.beneficiary}"