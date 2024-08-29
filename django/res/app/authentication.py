from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
import requests
import logging

logger = logging.getLogger(__name__)

class Intra42Authentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        jwt_authenticator = JWTAuthentication()
        try:
            user, validated_token = jwt_authenticator.authenticate(request)
            if user:
                return (user, None)
        except AuthenticationFailed:
            pass
        # Validar el access_token con la API de intra.42.fr
        response = requests.get('https://api.intra.42.fr/v2/me', headers={'Authorization': auth_header})
        if response.status_code != 200:
            raise AuthenticationFailed('Invalid or expired token')

        user_info = response.json()
        # Buscar o crear un usuario local
        from app.models import Users
        try:
            user = Users.objects.get(username=user_info['login'])
        except Users.DoesNotExist:
            raise AuthenticationFailed('Invalid or expired token')
        return (user, None)
