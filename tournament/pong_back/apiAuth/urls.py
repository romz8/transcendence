from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('checklogin/', views.check_login, name='checklogin'),
    path('whoami/', views.whoami, name='whoami'),
    path('refreshtoken/', TokenRefreshView.as_view(), name="refreshtoken")
]