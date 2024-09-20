from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
import requests
import logging
from app.models import Users

logger = logging.getLogger(__name__)

class Intra42Authentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        logger.info("==========================================================")
        logger.info(auth_header)
        logger.info("==========================================================")
        
        jwt_authenticator = JWTAuthentication()
        try:
            user, validated_token = jwt_authenticator.authenticate(request)
            if user:
                logger.info("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
                return (user, None)
        except AuthenticationFailed:
            logger.info("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            raise AuthenticationFailed('Invalid or expired token')
        raise AuthenticationFailed('Invalid or expired token')
