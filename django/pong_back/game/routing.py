# game/routing.py

from django.urls import path
from game.consumers.pong_consumer import PongConsumer

websocket_urlpatterns = [
    path('ws/pingpong/<str:game_id>/', PongConsumer.as_asgi()),
]
