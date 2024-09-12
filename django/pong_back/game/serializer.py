from game.models import Users
from .models import Match, WaitRoom, Tournament, Tourparticipation
from rest_framework import serializers
import logging

logger = logging.getLogger(__name__)

# class ProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Profile
#         fields = ["playername"]

# class UserSerializer(serializers.ModelSerializer):
#     profile = ProfileSerializer(read_only=True) #nesting the playername
    
    # class Meta:
    #     model = User
    #     fields = ["id", "username", "profile"]

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = "__all__"

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaitRoom
        fields = "__all__"

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = "__all__" 

# class TournamentDetailSerializer(serializers.ModelSerializer):
#     '''
#     Used for detailed view in the getTournament for winnerid
#     '''
#     winner = UserSerializer(read_only=True)
    
#     class Meta:
#         model = Tournament
#         fields = "__all__" 


class ParticipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tourparticipation
        fields = "__all__" 
    
    def validate(self, data):
        if self.instance is None:
            tournament= data.get('tournament')
            if tournament.state != "registering":
                raise serializers.ValidationError(f"Cannot join the tournament because it is {tournament.state}")
        return data

# class ParticipDetailSerializer(serializers.ModelSerializer):
#     # Serializer for retrieving Tourparticipation with nested user data
#     userid = UserSerializer(read_only=True)  # Nested serializer for the userid field

#     class Meta:
#         model = Tourparticipation
#         fields = "__all__"

# class MatchDetailSerializer(serializers.ModelSerializer):
#     player1 = UserSerializer(read_only=True)
#     player2 = UserSerializer(read_only=True)

#     class Meta:
#         model = Match
#         fields = "__all__"
