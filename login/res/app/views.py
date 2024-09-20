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
    username = request.user.username
    response = {"user": username}
    logger.info("****************************************************************************")
    logger.info(response)
    logger.info("****************************************************************************")
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