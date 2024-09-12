from django.urls import path
from . import views

urlpatterns = [
    path('', views.tournament_landing_page, name='landing_page'),
]