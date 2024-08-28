from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.forms.models import model_to_dict

from app.models import Users
import logging
import json
import os
import random

from django.contrib.auth import authenticate, login
from app.utilsApi42 import post42, get42

from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view


from datetime import datetime

logger = logging.getLogger(__name__)

@csrf_exempt
def uidenv(request):
    response = {'response': 'GET'}
    response['UID'] = os.environ['UID']
    return JsonResponse(response)

# @csrf_exempt
# def checkLogin(request):
#     body = json.loads(request.body.decode('utf-8'))
#     response = {'response': 'GET'}
#     if request.method == "POST":
#         exist = Users.objects.filter(id=body.get('user')).exists()
#         if not exist:
#             response['exist'] = False; 
#         else:
#             response['exist'] = True
#             user = Users.objects.get(id=body.get('user'))
#             user_dict = model_to_dict(user)
#             json_data = json.dumps(user_dict)
#             response['userdata'] = json_data
#     return JsonResponse(response)

@csrf_exempt
def insertLogin(request):
    response = get42('/v2/me', None, request.headers.get('Authorization'))
    if response.status_code == 200:
        body = response.json()
        logger.info("====================== BODY REQUEST ===========================")
        logger.info(body)
        logger.info("===============================================================")
        exist = Users.objects.filter(intra_id=body.get('id')).exists()
        resp = {'response': 'GET'}
        if not exist:
            user = Users(intra_id=body.get('id'), username=body.get('login'), alias=body.get('login'), img=body.get('image').get('link'),
                        intra=True, first_name=body.get('first_name'), last_name=body.get('last_name'),
                        campus=body.get('campus')[0].get('name'))
            user.save()
            resp['exist'] = False
        else:
            resp['exist'] = True
        resp['alias'] = body.get('login')
        resp['image'] = body.get('image').get('link')
        resp['id'] = body.get('id')
        return JsonResponse(resp)
    else:
        return JsonResponse({'error': 'Request 42 api wrong'}, status=response.status_code)

@csrf_exempt
def loginIntra(request):
    body = json.loads(request.body.decode('utf-8'))
    if request.method == "POST":
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
            logger.info("==============================RESPONSE INTRA==============================================")
            logger.info(response.get("created_at") + response.get("expires_in"))
            logger.info(datetime.fromtimestamp(response.get("created_at") + response.get("expires_in") + 86400))
            logger.info("==========================================================================================")
            formatResponse = {
                'refresh': str(response.get('refresh_token')),
                'access': str(response.get('access_token')),
                'refresh_exp': str(response.get('expires_in') + 86400),
                'token_exp': str(response.get('expires_in')),
            }
            return JsonResponse(formatResponse)
        except Exception as e:
            logger.info(str(e))
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Wrong method'}, status=405)

# @csrf_exempt
# def refreshToken(request):
#     body = json.loads(request.body.decode('utf-8'))
#     response = {'response': 'POST'}
#     if (not body.get('refresh_token')):
#         return JsonResponse({'error': 'Missing refresh token'}, status=400)
#     if request.method == "POST":
#         logger.info(body.get('refresh_token'))
#         params = {
#             'grant_type': 'refresh_token',
#             'client_id': os.environ['UID'],
#             'refresh_token': body.get('refresh_token')
#         }
#         response = post42("/oauth/token", params)
#         if response.get('access_token'):
#             logger.info(response)
#             formatResponse = {
#                 'refresh': str(response.get('refresh_token')),
#                 'access': str(response.get('access_token')),
#                 'refresh_exp': str(response.get('expires_in') + 86400),
#                 'token_exp': str(response.get('expires_in')),
#             }
#             return JsonResponse(formatResponse)
#     return JsonResponse(response)

# @csrf_exempt
# def singUp(request):
#     if request.method == "POST":
#         try:
#             body = json.loads(request.body.decode('utf-8'))
#             name = body.get('username')
#             first = body.get('firstname')
#             last = body.get('lastname')
#             password = body.get('password')
#             if not name or not first or not last or not password:
#                 return JsonResponse({'error': 'Missing arguments'}, status=400)
#             exist = User.objects.filter(username=name).exists()
#             response = {'response': 'POST'}
#             if exist:
#                 response["exist"] = True
#             else:
#                 u = User(username=name, first_name=first, last_name=last)
#                 u.set_password(password)
#                 u.save()

#                 animal = random.choice(["penguin", "cat", "chicken"])
#                 img = '../assets/loginimg/' + animal + '.jpeg'

#                 userid = "USER_" + str(u.id)
#                 aaa = Users(user=u, id=userid, campus="Campus of life", username=name, alias=name, name=first, lastname=last, img=img, intra=False)
#                 aaa.save()
#                 response["exist"] = False
#             return JsonResponse(response)
#         except Exception as e:
#             return JsonResponse({'error': str(e)}, status=500)
#     return JsonResponse({'error': 'Wrong method'}, status=405)

# @csrf_exempt
# def loginWeb(request):
#     if request.method == "POST":
#         try:
#             body = json.loads(request.body.decode('utf-8'))
#             username = body.get('username')
#             password = body.get('password')

#             if not username or not password:
#                 return JsonResponse({'error': 'Missing arguments'}, status=400)

#             user = authenticate(username=username, password=password)
#             if user is not None:
#                 users = Users.objects.get(user_id=user)
#                 refresh = RefreshToken.for_user(user)
#                 logger.info("==============================RESPONSE LOGINWEB==============================================")
#                 logger.info(refresh["exp"] - datetime.now().timestamp())
#                 logger.info(datetime.fromtimestamp(refresh["exp"]))
#                 logger.info("==========================================================================================")
#                 return JsonResponse({
#                     'refresh': str(refresh),
#                     'access': str(refresh.access_token),
#                     'refresh_exp': str(refresh["exp"] - datetime.now().timestamp()),
#                     'token_exp': str(refresh.access_token["exp"] - datetime.now().timestamp()),
#                     'id': users.id
#                 })
#             else:
#                 return JsonResponse({'error': 'Invalid credentials'})
#         except Exception as e:
#             logger.info(str(e))
#             return JsonResponse({'error': str(e)}, status=500)
#     return JsonResponse({'error': 'Wrong method'}, status=405)