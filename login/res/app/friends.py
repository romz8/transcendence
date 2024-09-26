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
    friend_details = Users.objects.filter(id__in=friend_ids).values('id', 'username','alias', 'first_name', 'last_name', 'img')
    friend_details_list = list(friend_details)
    
    for friend in friend_details_list:
        friend['mine'] = Friends.objects.filter(usersid1=user_id, usersid2=friend['id']).exists()
        # friend['active'] = UserStatus.objects.get(users_id=friend['id']).is_online

    return list(friend_details)

@api_view(['POST'])
def list_friends(request):
    try:
        user = request.user
        if not user:
            return JsonResponse({'error': 'Missing User'}, status=400)
        if Friends.objects.filter(Q(usersid1=user) | Q(usersid2=user)).exists():
            friendsList = get_friend_details(user, False)
            response = {
                'status': 'Friends',
                'friends': friendsList
            }
        else:
            response = {
                'status': 'Friends',
                'friends': []
            }
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST'])
def list_pending(request):
    try:
        user = request.user
        if not user:
            return JsonResponse({'error': 'Missing arguments'}, status=400)
        if Friends.objects.filter((Q(usersid1=user) | Q(usersid2=user)) & Q(pending=True)).exists():
            friendsList = get_friend_details(user, True)
            response = {
                'status': 'Pending',
                'friends': friendsList
            }
            return JsonResponse(response)
        else:
            response = {
                'status': 'Pending',
                'friends': []
            }
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST'])
def add_friend(request):
    try:
        body = json.loads(request.body.decode('utf-8'))
        username = body.get('username')
        fromuser = request.user
        if not username or not user:
            return JsonResponse({'error': 'Missing arguments'}, status=400)
        if Users.objects.filter(alias=username).exists():
            user = Users.objects.get(alias=username)
            if (Friends.objects.filter((Q(usersid1=user) & Q(usersid2=fromuser)) | (Q(usersid1=fromuser) & Q(usersid2=user))).exists()):
                return JsonResponse({'error': 'Already friends'}, status=400)
            response = {'exist': 'false'}
            newFriend = Friends(pending=True, usersid1=fromuser, usersid2=user)
            newFriend.save()
            return JsonResponse(response)
        else:
                return JsonResponse({'error': 'Dont exist username'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST'])
def confirm_friends(request):
    try:
        body = json.loads(request.body.decode('utf-8'))
        username = body.get('name')
        fromuser = request.user
        if not username or not fromuser:
            return JsonResponse({'error': 'Missing arguments'}, status=400)
        if Users.objects.filter(alias=username).exists():
            user = Users.objects.get(alias=username)
            if (Friends.objects.filter((Q(usersid1=user) & Q(usersid2=fromuser) & Q(pending=True))).exists()):
                friend = Friends.objects.get(usersid1=user, usersid2=fromuser, pending=True)
                friend.pending = False
                friend.save()
                return JsonResponse({'success': 'New friends'})
            else:
                return JsonResponse({'error': 'Not pending request'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)