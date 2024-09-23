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
def get_user_from_token(token):
    try:
        UntypedToken(token)
        jwt_auth = JWTAuthentication()
        validated_token = jwt_auth.get_validated_token(token)
        user = jwt_auth.get_user(validated_token)
        logger.error("User found in get_user_from_token")
        return user
    except (InvalidToken, TokenError):
        logger.error("Invalid Token Error in get_user_from_token")
        return AnonymousUser()

class JwtAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner 

    async def __call__(self, scope, receive, send):
        query_string = scope['query_string'].decode('utf-8')
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]
        
        if token is not None:
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await self.inner(scope, receive, send)
    
def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(AuthMiddlewareStack(inner))
