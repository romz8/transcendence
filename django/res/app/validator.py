
import requests
import logging
from functools import wraps
from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from app.models import Users
import os

logger = logging.getLogger(__name__)

def introspect_token(token):
    introspection_url = 'https://api.intra.42.fr/oauth/token/info'
    headers = {'Authorization': f'Bearer {token}'}

    try:
        response = requests.get(introspection_url, headers=headers)
        # logger.info(response.headers)
        if response.status_code == 200:
            data = response.json()
            data['active'] = 'resource_owner_id' in data and 'expires_in_seconds' in data and data['expires_in_seconds'] > 0
            # logger.info(data)
            return data
        return {'active': False}
    except Exception as e:
        logger.info(f"Exception during introspection: {e}")
        return {'active': False}
    
def token_required(scopes=None):
    def decorator(f):
        @wraps(f)
        def decorated(request, *args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)
            token = auth_header.split(' ')[1]

            jwt_authenticator = JWTAuthentication()
            try:
                user, validated_token = jwt_authenticator.authenticate(request)
                if user:
                    request.user = user
                    return f(request, *args, **kwargs)
            except AuthenticationFailed:
                pass

            token_info = introspect_token(token)
            if not token_info or not token_info.get('active'):
                return JsonResponse({'error': 'Invalid or inactive token'}, status=401)
            token_scopes = token_info.get('scopes', [])
            if not all(scope in token_scopes for scope in scopes):
                return JsonResponse({'error': 'Insufficient scope'}, status=403)
            if Users.objects.filter(id=token_info.get('resource_owner_id')).exists():
                if not (token_info.get('application').get('uid') and token_info.get('application').get('uid') == os.environ['UID']):
                    return JsonResponse({'error': 'Not genereted in this site'}, status=403)
            else:
                return JsonResponse({'error': 'Valid Acces_tokken but user no logged'}, status=403)
            request.user = token_info.get('resource_owner_id', 'anonymous')
            logger.info(request.user)
            request.scopes = token_scopes
            return f(request, *args, **kwargs)
        return decorated
    return decorator