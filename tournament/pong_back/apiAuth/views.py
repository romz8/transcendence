from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.http import JsonResponse
from rest_framework.response import Response 
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
import json
# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_view(request):
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return JsonResponse({'message': 'Username and password required'}, status=400)
    
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        fresh_token = RefreshToken.for_user(user)
        return JsonResponse({'message': 'You are logged in',
            'username': user.username, 
            'refresh': str(fresh_token),
            'access':str(fresh_token.access_token)}, status=200)
    else:
        return JsonResponse({'message': 'Invalid credentials'}, status=400)


@api_view(['POST'])
@csrf_exempt
def logout_view(request):
    try:
        logout(request)
        refresh_token = request.data['refresh']
        token = RefreshToken(refresh_token)
        token.blacklist()
        return JsonResponse({'message': 'You are logged out'}, status=200)
    except Exception as e :
        return JsonResponse({'error in logout': str(e)}, status=400)

@api_view(['GET'])
@csrf_exempt
def check_login(request):
    if request.user.is_authenticated:
        return Response({'IsAuthenticated': True, "username":request.user.username}, status=status.HTTP_200_OK)
    else:
        return Response({'IsAuthenticated': False}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@csrf_exempt
def whoami(request):
    if request.user.is_authenticated:
        return JsonResponse({'username': request.user.username})
    else:
        return JsonResponse({'username': None})