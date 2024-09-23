from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Users, Match, WaitRoom, Tournament, Tourparticipation


# Register the model with the custom admin class

admin.site.register(Users)
admin.site.register(Match)
admin.site.register(WaitRoom)
admin.site.register(Tournament)
admin.site.register(Tourparticipation)