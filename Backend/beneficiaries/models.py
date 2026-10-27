from django.db import models

from users.models import User


class Beneficiary(models.Model):

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"

    # Optional: only needed if the beneficiary has a login account
    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="beneficiary_profile"
    )

    aadhaar_no = models.CharField(
        max_length=12,
        unique=True
    )

    full_name = models.CharField(
        max_length=100
    )

    address = models.TextField()

    phone = models.CharField(
        max_length=15
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.full_name} - {self.aadhaar_no}"