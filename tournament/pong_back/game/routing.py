# game/routing.py

from django.urls import path
from game.consumers.pong_consumer import PongConsumer

websocket_urlpatterns = [
    #classic games path
    path('ws/pingpong/g/<str:game_id>/', PongConsumer.as_asgi()),
    #tournament game path
    path("ws/pingpong/t/<int:match_id>-<int:tour_id>/", PongConsumer.as_asgi())
]
