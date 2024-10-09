from django.urls import path
from . import views

urlpatterns = [
    path('set_tournament', views.set_tournament, name="set_tournament"),
    path('get_tournament', views.get_tournament, name="get_tournament")
]