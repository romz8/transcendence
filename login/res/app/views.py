from django.http import JsonResponse

import logging
from app.validator import token_required

from app.models import Users

import os
from django.db import IntegrityError
from rest_framework.decorators import api_view

from PIL import Image
from pathlib import Path
from django.core.files.base import ContentFile
import random
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)

@api_view(['GET'])
def verify_token(request):
    if request.user == AnonymousUser():
        return JsonResponse({'error': 'missing token'}, status=498)
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
    if request.user == AnonymousUser():
        return JsonResponse({'error': 'missing token'}, status=498)
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


def verify_ext(img, ext):
    if ext != "jpeg" and ext != "png" and ext != "jpg":
        return False

    try:
        image = Image.open(img)
        image.verify()
    except (IOError, SyntaxError) as e:
        return False
    return True

import string

def img_name_gen():
    caracteres = string.ascii_letters + string.digits
    cadena = ''.join(random.choice(caracteres) for _ in range(8))
    return (cadena)

@api_view(['POST'])
def updateInfoUser(request):
    if request.user == AnonymousUser():
        return JsonResponse({'error': 'missing token'}, status=498)
    users = request.user
    if request.POST['alias'] or request.FILES.get('imagefile'):
        if request.POST['alias']:
            try:
                if len(request.POST['alias']) < 3 :
                    return JsonResponse({'error': 'Alias to short'}, status=400)
                users.alias = request.POST['alias']
                users.save()
            except IntegrityError as e:
                logger.info("Duplicate alias!")
                return JsonResponse({'error': 'Alias already exists'}, status=400)
            except Exception as e:
                logger.info(str(e))
                return JsonResponse({'error': str(e)}, status=400)
        if request.FILES.get('imagefile'):
            img = request.FILES['imagefile']
            
            max_size_mb = 2
            max_size_bytes = max_size_mb * 1024 * 1024
            if img.size > max_size_bytes:
                return JsonResponse({"error": "File too Big"}, status=400)

            ext = img.name.split('.')[-1]
            if not verify_ext(img, ext):
                return JsonResponse({"error": "Bad file type"}, status=400)

            random_mesh = img_name_gen()
            new_filename = f"{users.username}{random_mesh}.{ext}"
            old_img = users.img.path if users.img else None        
            img.seek(0)
            users.img.save(new_filename, ContentFile(img.read()), save=True)
            try:
                if old_img:
                    if os.path.isfile(old_img):
                        os.remove(old_img)
                    else:
                        return JsonResponse({'error': 'Deleting Image'})
                else:
                    return JsonResponse({'error': 'Deleting Image'})
            except Exception as e:
                return JsonResponse({'error': 'Deleting Image'})
        return JsonResponse({'status': 'success'})
    return JsonResponse({'error': 'missing arguments'}, status=400)