from django.urls import path
from . import views

urlpatterns = [
    path("", views.slot_list_create, name="slot-list-create"),
    path("<int:pk>/", views.slot_detail, name="slot-detail"),
]