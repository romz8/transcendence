"""Authentication classes for channels - used for websocket connections"""
from urllib.parse import parse_qs
import logging
from channels.auth import AuthMiddlewareStack
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

#from django.contrib.auth.models import AnonymousUser
#from django.db import close_old_connections
#from jwt import InvalidSignatureError, ExpiredSignatureError, DecodeError

logger = logging.getLogger(__name__)

@database_sync_to_async
def get_user_from_token(username):
    if username:
        return Users.objects.get(username=username)
    else:
        return AnonymousUser()

class JwtAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner 
    
    async def __call__(self, scope, receive, send):
        query_string = scope['query_string'].decode('utf-8')
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]
        if not token:
            return None
        headers = {"Authorization": f"Bearer {token}"}
        logger.info(headers)
        req = requests.get("http://login:8080/verify_token/", headers=headers)
        logger.info(req.status_code)
        if req.status_code == 200:
            username = req.json()['user']
            scope['user'] = await get_user_from_token(username)
        else:
            scope['user'] = AnonymousUser()
        return await self.inner(scope, receive, send)
    
def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(AuthMiddlewareStack(inner))

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
import requests
import logging
from game.models import Users

logger = logging.getLogger(__name__)

class Intra42Authentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        headers = {"Authorization": auth_header}
        req = requests.get("http://login:8080/verify_token/", headers=headers)
        if req.status_code == 200:
            username = req.json()['user']
            if username:
                try:
                    user = Users.objects.get(username=username)
                    return (user, None)
                except Users.DoesNotExist:
                    raise AuthenticationFailed('Invalid or expired token')
        raise AuthenticationFailed('Invalid or expired token')
