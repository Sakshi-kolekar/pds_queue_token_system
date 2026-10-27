from django.urls import path

from .views import DashboardAPIView, TokenReportAPIView

urlpatterns = [
    path("dashboard/", DashboardAPIView.as_view(), name="report-dashboard"),
    path("tokens/", TokenReportAPIView.as_view(), name="report-tokens"),
]