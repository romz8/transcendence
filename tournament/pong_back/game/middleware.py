from urllib.parse import parse_qs
import logging
from asgiref.sync import sync_to_async
from channels.auth import AuthMiddlewareStack
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import get_user_model
import aiohttp

logger = logging.getLogger(__name__)

async def get_user_from_token(username):
    try:
        return await sync_to_async(Users.objects.get)(username=username)
    except ObjectDoesNotExist:
        raise AuthenticationFailed('Invalid or expired token')

class JwtAuthMiddleware:    
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope['query_string'].decode('utf-8')
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]
        
        if not token:
            raise AuthenticationFailed('Invalid or expired token')

        headers = {"Authorization": f"Bearer {token}"}
        logger.info(f"Headers sent: {headers}")

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get("http://login:8080/verify_token/", headers=headers) as resp:
                    if resp.status == 200:
                        json_resp = await resp.json()
                        username = json_resp.get('user')
                        if username:
                            scope['user'] = await get_user_from_token(username)
                        else:
                            raise AuthenticationFailed('Invalid or expired token')
                    else:
                        logger.error(f"Token verification failed with status: {resp.status}")
                        raise AuthenticationFailed('Invalid or expired token')
        except aiohttp.ClientError as e:
            logger.error(f"HTTP error: {e}")
            raise AuthenticationFailed('Invalid or expired token')

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