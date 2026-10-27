from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "action",
        "entity_name",
        "entity_id",
        "created_at",
    )
    list_filter = ("action", "entity_name", "created_at")
    search_fields = (
        "user__username",
        "action",
        "entity_name",
    )
    readonly_fields = (
        "user",
        "action",
        "entity_name",
        "entity_id",
        "details",
        "created_at",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
