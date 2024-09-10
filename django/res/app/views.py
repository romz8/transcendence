from django.http import JsonResponse

import logging
from app.validator import token_required
from app.validator import introspect_token

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from app.models import Users

import os
import json
from django.db import IntegrityError
from django.db.models import Q, F
from rest_framework.decorators import api_view

logger = logging.getLogger(__name__)

@api_view(['GET'])
def verify_token(request):
    auth_header = request.headers.get('Authorization')
    token = auth_header.split(' ')[1]

    jwt_authenticator = JWTAuthentication()
    try:
        user, validated_token = jwt_authenticator.authenticate(request)
        if user:
            response = {"user": user.id}
            return (JsonResponse(response))
    except AuthenticationFailed:
        pass

    token_info = introspect_token(token)
    if not token_info or not token_info.get('active'):
        return JsonResponse({'error': 'Invalid or inactive token'})
    if Users.objects.filter(intra_id=token_info.get('resource_owner_id')).exists():
        if not (token_info.get('application').get('uid') and token_info.get('application').get('uid') == os.environ['UID']):
            return JsonResponse({'error': 'Not genereted in this site'}, status=403)
    else:
        return JsonResponse({'error': 'Valid Acces_tokken but user no logged'}, status=403)
    response = {"user": token_info.get('resource_owner_id', 'anonymous')}
    return JsonResponse(response)


@token_required(scopes=['public'])
def protected_view(request):
    logger.info("Accessing protected resource")
    return JsonResponse({"message": "This is a protected resource"})

@api_view(['GET'])
def infoUser(request):
    user = request.user

    user_json = {
        'id': user.id,
        'username': user.username,
        'alias': user.alias,
        'campus': user.campus,
        'name': user.first_name,
        'lastname': user.last_name,
        'img': "http://localhost:8080" + user.img.url,
    }
    return JsonResponse(user_json)


@api_view(['POST'])
def updateInfoUser(request):
    try:
        user = request.user
        body = json.loads(request.body.decode('utf-8'))
        alias = body.get('alias')
        if alias:
            user.alias = alias
            user.save()
            return JsonResponse({'success': 'info updated'})
    except IntegrityError as e:
        logger.info("Duplicate alias!")
        return JsonResponse({'error': 'duplicate alias'})
    except Exception as e:
        logger.info(str(e))
        return JsonResponse({'error': str(e)}, status=500)