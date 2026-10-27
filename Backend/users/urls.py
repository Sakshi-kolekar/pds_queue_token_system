from django.urls import path
from .views import UserListCreateAPIView, UserDetailAPIView

urlpatterns = [
    path("", UserListCreateAPIView.as_view(), name="user-list-create"),
    path("<int:pk>/", UserDetailAPIView.as_view(), name="user-detail"),
]