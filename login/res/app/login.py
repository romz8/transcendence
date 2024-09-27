from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.forms.models import model_to_dict
from django.core.files.base import ContentFile
from PIL import Image
from pathlib import Path

from app.models import Users, UserStatus
import logging
import json
import os
import random

from django.contrib.auth import authenticate
from app.utilsApi42 import post42, get42
from django.contrib.auth.models import AnonymousUser

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
import re

from datetime import datetime

logger = logging.getLogger(__name__)

@api_view(['GET'])
def uidenv(request):
    response = {'response': 'GET'}
    response['UID'] = os.environ['UID']
    return JsonResponse(response)

@api_view(['POST'])
def checkLogin(request):
    body = json.loads(request.body.decode('utf-8'))
    response = {'response': 'GET'}
    exist = Users.objects.filter(id=body.get('user')).exists()
    if not exist:
        response['exist'] = False; 
    else:
        response['exist'] = True
        user = Users.objects.get(id=body.get('user'))
        user_dict = model_to_dict(user)
        json_data = json.dumps(user_dict)
        response['userdata'] = json_data

import requests
from io import BytesIO

def download_and_save_image(user, url):
    response = requests.get(url)
    
    if response.status_code == 200:
        ext = url.split('.')[-1]

        random_mesh = img_name_gen()
        image_name = f"{user.username}{random_mesh}.{ext}"
        img_temp = BytesIO(response.content)

        try:
            image = Image.open(img_temp)
            image.verify()
        except (IOError, SyntaxError) as e:
            return {'status': 'error'}
        
        if user.img:
            if os.path.isfile(user.img.path):
                user.img.delete()

        user.img.save(image_name, ContentFile(response.content), save=True)
        return {'status': 'success', 'url_imagen': user.img.url}
    return {'status': 'error'}

def insertLogin(tokken):
    response = get42('/v2/me', None, tokken)
    if response.status_code == 200:
        body = response.json()
        exist = Users.objects.filter(intra_id=body.get('id')).exists()
        if not exist:
            user = Users(intra_id=body.get('id'), username=f'42-{body.get('login')}', alias=body.get('login'),
                        intra=True, first_name=body.get('first_name'), last_name=body.get('last_name'),
                        campus=body.get('campus')[0].get('name'))
            value = download_and_save_image(user, body.get('image').get('link'))
            if value["status"] == 'error':
                return AnonymousUser()
            user.save()
            return user
        return Users.objects.get(intra_id=body.get('id'))
    else:
        return AnonymousUser()

@api_view(['POST'])
def loginIntra(request):
    body = json.loads(request.body.decode('utf-8'))
    if (not body.get('code') or not body.get('state')):
        return JsonResponse({'error': 'Missing state or code'}, status=400)
    response = {'response': 'POST'}
    params = {
        'grant_type': 'authorization_code',
        'client_id': os.environ['UID'],
        'client_secret': os.environ['SECRET'],
        'code': body.get('code'),
        'redirect_uri': "http://localhost:3000/",
        'state': body.get('state')
    }
    try:
        response = post42("/oauth/token", params)
        if response.status_code != 200:
            return JsonResponse({'error': 'Bad request'}, status=response.status_code)
        resjson = response.json()
        user = insertLogin(str(resjson.get('access_token')))
        if (user == AnonymousUser):
            return({'error': 'Error with insert Login'}, 400)
        refresh = RefreshToken.for_user(user)
        logger.info(refresh["exp"])
        logger.info(refresh.access_token["exp"])
        logger.info(datetime.now().timestamp())
        formatResponse = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'refresh_exp': str(refresh["exp"] - datetime.now().timestamp()),
            'token_exp': str(refresh.access_token["exp"] - datetime.now().timestamp()),
        }
        return JsonResponse(formatResponse)
    except Exception as e:
        logger.info(str(e))
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
def refreshToken(request):
    body = json.loads(request.body.decode('utf-8'))
    if (not body.get('refresh_token')):
        return JsonResponse({'error': 'Missing refresh token'}, status=400)

    try:
        old_refresh = RefreshToken(body.get('refresh_token'))
        return JsonResponse({
            'refresh': str(old_refresh),
            'refresh_exp': str(old_refresh["exp"] - datetime.now().timestamp()),
            'access': str(old_refresh.access_token),
            'token_exp': str(old_refresh.access_token['exp'] - datetime.now().timestamp()),
        })
    except:
        pass
    
    params = {
        'grant_type': 'refresh_token',
        'client_id': os.environ['UID'],
        'refresh_token': body.get('refresh_token')
    }
    response = post42("/oauth/token", params)
    if response.status_code != 200:
        return JsonResponse({'error': 'Bad request'}, status=response.status_code)
    respjson = response.json()
    if respjson.get('access_token'):
        formatResponse = {
            'refresh': str(respjson.get('refresh_token')),
            'access': str(respjson.get('access_token')),
            'refresh_exp': str(respjson.get('expires_in') + 86400),
            'token_exp': str(respjson.get('expires_in')),
        }
        return JsonResponse(formatResponse)
    return JsonResponse({'error': 'Missing acces_token in api 42'}, status=400)

def checkArgs(name, first, last, pswd, reppswd):
    if not name or not first or not last or not pswd or not reppswd:
        return False
    if len(name) < 3 or len(first) < 2 or len(last) < 2:
        return False
    if not re.match(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&_=+-]).{8,16}$", pswd):
        return False
    if not pswd == reppswd:
        return False
    return True

@api_view(['POST'])
def signUp(request):
    try:
        username = request.POST['username']
        first = request.POST['name']
        last = request.POST['lastname']
        pswd = request.POST['password']
        reppswd = request.POST['passwordrep']
        logger.info(f"NAME: {username} first: {first} last: {last} pswd: {pswd} reppswd: {reppswd}")
        if not checkArgs(username, first, last, pswd, reppswd):
            return JsonResponse({'error': 'Bad arguments'}, status=400)
        exist = Users.objects.filter(username=username).exists()
        response = {'response': 'POST'}
        if exist:
            response["error"] = "User Alredy exist"
            return JsonResponse(response, status=400)
        else:
            user = Users(campus="Campus of life", username=username, alias=username,
                         first_name=first, last_name=last, intra=False)
            user.set_password(pswd)
            user.save()
            userStatus = UserStatus(users=user, is_online=False)
            userStatus.save()
            animal = random.choice(["penguin.jpeg", "cat.jpeg", "chicken.jpeg"])
            random_mesh = img_name_gen()
            imgcontentpath = f"{str(Path(__file__).resolve().parent.parent)}/media/def/{animal}"
            with open(imgcontentpath, 'rb') as file:
                content = file.read()
            img = f"{username}{random_mesh}.jpeg"
            user.img.save(img, ContentFile(content), save=True)
            userStatus = UserStatus.objects.create(users=user, is_online=False)
            userStatus.save()
            response["exist"] = False
        return JsonResponse(response)
    except Exception as e:
        logger.info(str(e))
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST'])
def loginWeb(request):
    try:
        username = request.POST['username']
        password = request.POST['password']

        if not username or not password:
            return JsonResponse({'error': 'Missing arguments'}, status=400)
        logger.info(username)
        logger.info(password)
        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return JsonResponse({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'refresh_exp': str(refresh["exp"] - datetime.now().timestamp()),
                'token_exp': str(refresh.access_token["exp"] - datetime.now().timestamp()),
                'id': user.id
            })
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=409)
    except Exception as e:
        logger.info(str(e))
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST'])
def username_check(request):
    try:
        body = json.loads(request.body.decode('utf-8'))
        username = body['username']
        exist = Users.objects.filter(username=username).exists()
        return JsonResponse({'exist': str(exist)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

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
def changeImg(request):
    if request.FILES.get('img'):
        users = request.user
        img = request.FILES['img']
        
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
        if old_img:
            if os.path.isfile(old_img):
                os.remove(old_img)
        return JsonResponse({'status': 'success', 'url_imagen': users.img.url})
    return JsonResponse({'status': 'error'}, status=400)