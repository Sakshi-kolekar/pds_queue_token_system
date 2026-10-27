from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.auth_urls")),
    path("api/beneficiaries/", include("beneficiaries.urls")),
    path("api/users/", include("users.urls")),
    path("api/counters/", include("counters.urls")),
    path("api/slots/", include("slots.urls")),
    path("api/tokens/", include("tokens.urls")),
    path("api/queue/", include("tokens.queue_urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/audit-logs/", include("audit_logs.urls")),
    path("api/reports/", include("reports.urls")),
]