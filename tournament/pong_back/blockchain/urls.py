from django.urls import path
from . import views

urlpatterns = [
    path('get_tournament', views.get_tournament, name="get_tournament")
]