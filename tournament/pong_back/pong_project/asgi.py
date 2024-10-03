"""
ASGI config for pong_project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from game.middleware import JwtAuthMiddlewareStack #imported to route to game app middleware.py
from game.routing import websocket_urlpatterns #imported to route to game app asgi routing.py

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pong_project.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JwtAuthMiddlewareStack(
            URLRouter(
            websocket_urlpatterns
        )
    ),
})
