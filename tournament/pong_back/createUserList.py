import os
import django
from game.models import Users

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pong_project.settings') 
django.setup()

# List of profiles to create
profiles = [
    {"username": "Brad", "alias": "Pitt"},
    {"username": "a", "alias": "a"},
    {"username": "Neuromancer", "alias": "Winterminute"},
    {"username": "john wick", "alias": "Wick"},
    {"username": "Molly", "alias": "street samurai"},
    {"username": "Case", "alias": "Case_neuromancer"},
]

AIs = [{"username":"AI_" + str(x),"alias":"HAL_" + str(x)} for x in range(1,8)]

# Function to create Userss and profiles
def create_Userss_and_profiles(profiles):
    for profile_data in profiles:
        username = profile_data['username']
        alias = profile_data['alias']
        
        # Create the Users if it does not exist
        user, created = Users.objects.get_or_create(username=username, alias=alias, intra=True, campus="CAMPUS OF LIFE")
        if created:
            user.set_password('pwd')  # Set a default password
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
create_Userss_and_profiles(profiles)
create_Userss_and_profiles(AIs)