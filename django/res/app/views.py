from django.http import JsonResponse

import logging
from app.validator import token_required
from app.validator import introspect_token
from django.views.decorators.csrf import csrf_exempt

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from app.models import Users, Friends, UserStatus
from django.core import serializers

import os
import json
from django.db.models import Q, F
from django.forms.models import model_to_dict

logger = logging.getLogger(__name__)

@csrf_exempt
def verify_token(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)
    token = auth_header.split(' ')[1]
    # logger.info(token)
    jwt_authenticator = JWTAuthentication()
    try:
        user, validated_token = jwt_authenticator.authenticate(request)
        if user:
            userid = f'USER_{user.id}'
            response = {"user": userid}
            logger.info(response)
            return JsonResponse(response)
    except AuthenticationFailed:
        pass

    token_info = introspect_token(token)
    # logger.info(token_info)
    if not token_info or not token_info.get('active'):
        return JsonResponse({'error': 'Invalid or inactive token'})
    if Users.objects.filter(id=token_info.get('resource_owner_id')).exists():
        if not (token_info.get('application').get('uid') and token_info.get('application').get('uid') == os.environ['UID']):
            return JsonResponse({'error': 'Not genereted in this site'}, status=403)
    else:
        return JsonResponse({'error': 'Valid Acces_tokken but user no logged'}, status=403)
    # logger.info(token_info)
    response = {"user": token_info.get('resource_owner_id', 'anonymous')}
    return JsonResponse(response)


@token_required(scopes=['public'])
def protected_view(request):
    logger.info("Accessing protected resource")
    return JsonResponse({"message": "This is a protected resource"})

@token_required(scopes=['public'])
def infoUser(request):
    userid = request.user
    user = Users.objects.get(id=userid)
    user_json = {
        'id': user.id,
        'username': user.username,
        'alias': user.alias,
        'campus': user.campus,
        'name': user.name,
        'lastname': user.lastname,
        'img': user.img
    }
    return JsonResponse(user_json)

def get_friend_details(user_id, pend):
    friends = Friends.objects.filter((Q(usersid1=user_id) | Q(usersid2=user_id)) & Q(pending=pend))
    friend_ids = friends.values_list('usersid1', 'usersid2')
    friend_ids = [fid[0] if fid[0] != user_id else fid[1] for fid in friend_ids]
    friend_details = Users.objects.filter(id__in=friend_ids).values('id', 'alias', 'name', 'lastname')
    friend_details_list = list(friend_details)
    
    for friend in friend_details_list:
        friend['mine'] = Friends.objects.filter(usersid1=user_id, usersid2=friend['id']).exists()
        # logger.info(UserStatus.objects.get(users_id=friend['id']).is_online)
        friend['active'] = UserStatus.objects.get(users_id=friend['id']).is_online

    return list(friend_details)

@csrf_exempt
@token_required(scopes=['public'])
def list_friends(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body.decode('utf-8'))
            user_id = body.get('id')
            logger.info(user_id)
            if not user_id:
                return JsonResponse({'error': 'Missing arguments'}, status=400)
            if Friends.objects.filter(Q(usersid1=user_id) | Q(usersid2=user_id)).exists():
                friendsList = get_friend_details(user_id, False)
                response = {
                    'status': 'Friends',
                    'friends': friendsList
                }
                return JsonResponse(response)
            else:
                return JsonResponse({'status': 'dont have friends'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Wrong method'}, status=405)

@csrf_exempt
@token_required(scopes=['public'])
def list_pending(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body.decode('utf-8'))
            user_id = body.get('id')
            logger.info(user_id)
            if not user_id:
                return JsonResponse({'error': 'Missing arguments'}, status=400)
            if Friends.objects.filter((Q(usersid1=user_id) | Q(usersid2=user_id)) & Q(pending=True)).exists():
                friendsList = get_friend_details(user_id, True)
                response = {
                    'status': 'Pending',
                    'friends': friendsList
                }
                return JsonResponse(response)
            else:
                return JsonResponse({'status': 'dont have pending'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Wrong method'}, status=405)

@csrf_exempt
@token_required(scopes=['public'])
def add_friend(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body.decode('utf-8'))
            username = body.get('name')
            fromID = body.get('id')
            if not username or not fromID:
                return JsonResponse({'error': 'Missing arguments'}, status=400)
            if Users.objects.filter(alias=username).exists():
                user = Users.objects.get(alias=username)
                if (Friends.objects.filter((Q(usersid1=user.id) & Q(usersid2=fromID)) | (Q(usersid1=fromID) & Q(usersid2=user.id))).exists()):
                    return JsonResponse({'exist': 'true'})
                response = {'exist': 'false'}
                newFriend = Friends(pending=True, usersid1=Users.objects.get(id=fromID), usersid2=user)
                newFriend.save()
                return JsonResponse(response)
            else:
                    return JsonResponse({'error': 'Dont exist username'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Wrong method'}, status=405)

@csrf_exempt
@token_required(scopes=['public'])
def confirm_friends(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body.decode('utf-8'))
            username = body.get('name')
            fromID = body.get('id')
            logger.info(username)
            logger.info(fromID)
            if not username or not fromID:
                return JsonResponse({'error': 'Missing arguments'}, status=400)
            if Users.objects.filter(alias=username).exists():
                user = Users.objects.get(alias=username)
                if (Friends.objects.filter((Q(usersid1=user.id) & Q(usersid2=fromID) & Q(pending=True))).exists()):
                    friend = Friends.objects.get(usersid1=user.id, usersid2=fromID, pending=True)
                    friend.pending = False
                    friend.save()
                    return JsonResponse({'success': 'New friends'})
                else:
                    return JsonResponse({'error': 'Not pending request'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Wrong method'}, status=405)

@csrf_exempt
@token_required(scopes=['public'])
def updateInfoUser(request):
    if request.method == "POST":
        try:
            userid = request.user
            body = json.loads(request.body.decode('utf-8'))
            alias = body.get('alias')
            logger.info(alias)
            if alias:
                user = Users.objects.get(id=userid)
                user.alias = alias
                user.save()
                return JsonResponse({'success': 'info updated'})
        except Exception as e:
            logger.info(str(e))
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Wrong method'}, status=405)