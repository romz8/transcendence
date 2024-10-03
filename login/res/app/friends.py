from django.http import JsonResponse

import logging

from app.models import Users, Friends, UserStatus

import json
from django.db.models import Q
from rest_framework.decorators import api_view
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)

def get_friend_details(user, pend):
    friends = []
    friendships = Friends.objects.filter((Q(usersid1=user) | Q(usersid2=user)) & Q(pending=pend))
    logger.info(friendships)
    for friendship in friendships:
        if friendship.usersid1 == user:
            friend = friendship.usersid2
            mine = False
        else:
            friend = friendship.usersid1
            mine = True
        if pend == False or (pend == True and mine == True) :
            friends.append({
                'id': friend.id,
                'username': friend.username,
                'alias': friend.alias,
                'first_name': friend.first_name,
                'last_name': friend.last_name,
                'img': "http://localhost:8080" + friend.img.url,
                'mine': mine,
                'online': UserStatus.objects.get(users=user).is_online
            })


    return list(friends)

@api_view(['POST'])
def list_friends(request):
    try:
        user = request.user
        if not user or user == AnonymousUser():
            return JsonResponse({'error': 'Missing Access Token'}, status=400)
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
        if not user or user == AnonymousUser():
            return JsonResponse({'error': 'Missing Access Token'}, status=400)
        if Friends.objects.filter((Q(usersid1=user) | Q(usersid2=user)) & Q(pending=True)).exists():
            friendsList = get_friend_details(user, True)
            response = {
                'status': 'Pending',
                'friends': friendsList
            }
        else:
            response = {
                'status': 'Pending',
                'friends': []
            }
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST'])
def add_friend(request):
    try:
        username = request.POST["username"]
        fromuser = request.user
        if username == fromuser.username:
            return JsonResponse({'error': 'You need friends, so please stop adding yourself'}, status=400)
        if not fromuser or fromuser == AnonymousUser() or not username:
            return JsonResponse({'error': 'Missing Access Token'}, status=400)
        if Users.objects.filter(username=username).exists():
            user = Users.objects.get(username=username)
            if (Friends.objects.filter((Q(usersid1=user) & Q(usersid2=fromuser)) | (Q(usersid1=fromuser) & Q(usersid2=user))).exists()):
                return JsonResponse({'error': 'Already friends'}, status=400)
            response = {'exist': 'false'}
            newFriend = Friends(pending=True, usersid1=fromuser, usersid2=user)
            newFriend.save()
            return JsonResponse(response)
        else:
            return JsonResponse({'error': 'Username doesn\'t exist'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST'])
def confirm_friends(request):
    try:
        body = json.loads(request.body.decode('utf-8'))
        username = body.get('username')
        fromuser = request.user
        if not fromuser or fromuser == AnonymousUser() or not username:
            return JsonResponse({'error': 'Missing Access Token'}, status=400)
        if Users.objects.filter(username=username).exists():
            user = Users.objects.get(username=username)
            if (Friends.objects.filter((Q(usersid1=user) & Q(usersid2=fromuser) & Q(pending=True))).exists()):
                friend = Friends.objects.get(usersid1=user, usersid2=fromuser, pending=True)
                friend.pending = False
                friend.save()
                return JsonResponse({'success': 'New friends'})
            else:
                return JsonResponse({'error': 'Not pending request'}, status=400)
        return JsonResponse({'error': 'Not pending request'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST'])
def delete_friend(request):
    try:
        body = json.loads(request.body.decode('utf-8'))
        username = body.get('username')
        fromuser = request.user
        if not fromuser or fromuser == AnonymousUser() or not username:
            return JsonResponse({'error': 'Missing Access Token'}, status=400)
        if Users.objects.filter(username=username).exists():
            user = Users.objects.get(username=username)
            if (Friends.objects.filter((Q(usersid1=user) & Q(usersid2=fromuser))).exists()):
                friend = Friends.objects.get(usersid1=user, usersid2=fromuser)
                friend.delete()
                return JsonResponse({'success': 'Deleted a friend YOU ARE A BAD PERSON:('})
            elif (Friends.objects.filter((Q(usersid2=user) & Q(usersid1=fromuser))).exists()):
                friend = Friends.objects.get(usersid2=user, usersid1=fromuser)
                friend.delete()
                return JsonResponse({'success': 'Deleted a friend YOU ARE A BAD PERSON:('})
            else:
                return JsonResponse({'error': 'No Friends to delete :('}, status=400)
        return JsonResponse({'error': 'Not pending request'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST'])
def delete_pending(request):
    try:
        body = json.loads(request.body.decode('utf-8'))
        username = body.get('username')
        fromuser = request.user
        if not fromuser or fromuser == AnonymousUser() or not username:
            return JsonResponse({'error': 'Missing Access Token'}, status=400)
        if Users.objects.filter(username=username).exists():
            user = Users.objects.get(username=username)
            if (Friends.objects.filter((Q(usersid1=user) & Q(usersid2=fromuser) & Q(pending=True))).exists()):
                friend = Friends.objects.get(usersid1=user, usersid2=fromuser, pending=True)
                friend.delete()
                return JsonResponse({'success': 'Delete pending request'})
            else:
                return JsonResponse({'error': 'Not pending request'}, status=400)
        return JsonResponse({'error': 'Not pending request'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)