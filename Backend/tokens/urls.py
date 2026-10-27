from django.urls import path

from .queue_views import TokenHistoryAPIView
from .views import (
    TokenDetailAPIView,
    TokenListCreateAPIView,
    TokenWorkflowAPIView,
)

urlpatterns = [
    path(
        "",
        TokenListCreateAPIView.as_view(),
        name="token-list-create",
    ),
    path(
        "<int:pk>/",
        TokenDetailAPIView.as_view(),
        name="token-detail",
    ),
    path(
        "<int:pk>/history/",
        TokenHistoryAPIView.as_view(),
        name="token-history",
    ),
    path(
        "<int:pk>/<str:action>/",
        TokenWorkflowAPIView.as_view(),
        name="token-workflow",
    ),
]