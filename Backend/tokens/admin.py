from django.contrib import admin
from .models import Token


@admin.register(Token)
class TokenAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "token_no",
        "token_date",
        "beneficiary",
        "slot",
        "status",
        "missed_count",
        "served_by",
    )
    list_filter = ("status", "token_date", "slot")
    search_fields = (
        "token_no",
        "beneficiary__full_name",
        "beneficiary__phone",
    )
    readonly_fields = (
        "generated_at",
        "called_at",
        "served_at",
        "missed_at",
        "created_at",
        "updated_at",
    )
