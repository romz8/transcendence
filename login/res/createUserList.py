import os
import django
from app.models import Users
from django.core.files.base import ContentFile
import random
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pong_project.settings') 
django.setup()

AIs = [{"username":"AI_" + str(x),"alias":"HAL_" + str(x)} for x in range(1,8)]

import string

def img_name_gen():
    char = string.ascii_letters + string.digits
    str = ''.join(random.choice(char) for _ in range(8))
    return (str)

# Function to create Userss and profiles
def create_Userss_and_profiles(profiles):
    for profile_data in profiles:
        username = profile_data['username']
        alias = profile_data['alias']
        
        # Create the Users if it does not exist
        user, created = Users.objects.get_or_create(username=username, alias=alias, intra=True, campus="CAMPUS OF LIFE", is_ai=True, img="def/ai_img.jpeg")
        if created:
            user.save()

def create_superusers():
    supername = "romain"
    superpwd = "Pong4ever!"
    user, created = Users.objects.get_or_create(username=supername, alias="super", intra=True, campus="CAMPUS OF LIFE")
    if  created:
        user.set_password(superpwd)
        user.is_superuser=True
        user.is_staff = True 
        user.save()

# Run the function
create_superusers()
create_Userss_and_profiles(AIs)
