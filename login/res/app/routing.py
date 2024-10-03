from django.urls import re_path
from . import userstatus

websocket_urlpatterns = [
    re_path(r'ws/user_status/$', userstatus.UserStatusConsumer.as_asgi()),
]