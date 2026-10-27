
from django.urls import path
from . import views

urlpatterns = [
    path("", views.counter_list_create, name="counter-list-create"),
    path("<int:pk>/", views.counter_detail, name="counter-detail"),
]