from django.http import JsonResponse

import logging

from app.models import Users, Friends, UserStatus

import json
from django.db.models import Q
from rest_framework.decorators import api_view

logger = logging.getLogger(__name__)

def get_friend_details(user_id, pend):
    friends = Friends.objects.filter((Q(usersid1=user_id) | Q(usersid2=user_id)) & Q(pending=pend))
    friend_ids = friends.values_list('usersid1', 'usersid2')
    friend_ids = [fid[0] if fid[0] != user_id else fid[1] for fid in friend_ids]
    friend_details = Users.objects.filter(id__in=friend_ids).values('id', 'alias', 'name', 'lastname')
    friend_details_list = list(friend_details)
    
    for friend in friend_details_list:
        friend['mine'] = Friends.objects.filter(usersid1=user_id, usersid2=friend['id']).exists()
        friend['active'] = UserStatus.objects.get(users_id=friend['id']).is_online

    return list(friend_details)

@api_view(['POST'])
def list_friends(request):
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

@api_view(['POST'])
def list_pending(request):
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

@api_view(['POST'])
def add_friend(request):
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

@api_view(['POST'])
def confirm_friends(request):
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