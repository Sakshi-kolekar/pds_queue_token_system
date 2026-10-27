from django.contrib import admin
from .models import Slot


@admin.register(Slot)
class SlotAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "counter",
        "slot_date",
        "start_time",
        "end_time",
        "max_tokens",
        "status",
    )
    list_filter = ("slot_date", "status", "counter")
    ordering = ("slot_date", "start_time")