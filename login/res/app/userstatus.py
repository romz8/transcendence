import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import UserStatus

logger = logging.getLogger(__name__)

class UserStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if self.user:
            await self.accept()
            await self.set_user_online(self.user)
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user:
            await self.set_user_offline(self.user)

    async def receive(self, text_data):
        pass

    @database_sync_to_async
    def set_user_online(self, user):
        status = UserStatus(users=user,is_online=True)
        status.save()

    @database_sync_to_async
    def set_user_offline(self, user):
        status = UserStatus.objects.get(users=user)
        status.is_online = False
        status.save()