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
from django.core.exceptions import ValidationError

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

@api_view(['GET'])
def getLang(request):
    if request.user == AnonymousUser() or not request.user:
        return JsonResponse({'error': 'missing token'}, status=498)
    user = request.user
    return JsonResponse({'language': user.lang})

@api_view(['GET'])
def infoUser(request):
    if request.user == AnonymousUser() or not request.user:
        return JsonResponse({'error': 'missing token'}, status=498)
    user = request.user
    url = user.img

    if not url:
        url = "/login/media/def/default.jpg"
    else:
        url = url.url
    user_json = {
        'id': user.id,
        'username': user.username,
        'alias': user.alias,
        'campus': user.campus,
        'name': user.first_name,
        'lastname': user.last_name,
        'img': "https://localhost:3001" + url,
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
    
    if request.POST.get('alias') or request.FILES.get('imagefile') or request.POST.get("language"):
        if request.POST.get('alias'):
            response = update_alias(users, request.POST['alias'])
            if response:
                return response

        if request.POST.get("language"):
            response = update_language(users, request.POST["language"])
            if response:
                return response
        
        if request.FILES.get('imagefile'):
            response = update_image(users, request.FILES['imagefile'])
            if response:
                return response
        
        return JsonResponse({'status': 'success'})
    
    return JsonResponse({'error': 'missing arguments'}, status=400)


def update_alias(users, alias):
    try:
        if len(alias) < 3:
            return JsonResponse({'error': 'Alias too short'}, status=400)
        
        users.alias = alias
        users.save()
    except IntegrityError:
        logger.info("Duplicate alias!")
        return JsonResponse({'error': 'Alias already exists'}, status=400)
    except Exception as e:
        logger.info(str(e))
        return JsonResponse({'error': str(e)}, status=400)
    return None


def update_language(users, lang):
    VALID_LANGS = ['es', 'en', 'fr', 'ca', 'ES', 'EN', 'FR', 'CA']
    
    try:
        if lang not in VALID_LANGS:
            return JsonResponse({'error': 'Invalid lang, only es, en, fr, ca allowed'}, status=400)
        
        users.lang = lang
        users.save()
    except ValidationError:
        return JsonResponse({'error': 'Invalid lang, only es, en, fr, ca allowed'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    return None


def update_image(users, img):
    max_size_mb = 2
    max_size_bytes = max_size_mb * 1024 * 1024

    if img.size > max_size_bytes:
        return JsonResponse({"error": "File too big"}, status=400)

    ext = img.name.split('.')[-1]
    if not verify_ext(img, ext):
        return JsonResponse({"error": "Bad file type"}, status=400)

    random_mesh = img_name_gen()
    new_filename = f"{users.username}{random_mesh}.{ext}"
    old_img = users.img.path if users.img else None

    img.seek(0)
    users.img.save(new_filename, ContentFile(img.read()), save=True)

    try:
        if old_img and os.path.isfile(old_img):
            os.remove(old_img)
        elif old_img:
            return JsonResponse({'error': 'Error deleting old image'}, status=400)
    except Exception as e:
        return JsonResponse({'error': 'Error deleting image'}, status=400)

    return None
