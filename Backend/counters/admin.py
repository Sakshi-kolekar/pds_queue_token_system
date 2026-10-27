from django.contrib import admin
from .models import Counter


@admin.register(Counter)
class CounterAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "counter_no",
        "name",
        "status",
        "operator",
    )
    list_filter = ("status",)
    search_fields = ("counter_no", "name", "operator__username")
