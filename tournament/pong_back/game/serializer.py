from .models import Users, Match, WaitRoom, Tournament, Tourparticipation
from rest_framework import serializers
import logging

logger = logging.getLogger(__name__)

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['id', 'alias', 'campus', 'intra', 'is_ai']

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = "__all__"

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaitRoom
        fields = "__all__"
        read_only_fields = ["owner","attendee"]

class RoomDetailSerializer(serializers.ModelSerializer):
    owner = CustomUserSerializer(read_only=True)
    attendee = CustomUserSerializer(read_only=True)
    class Meta:
        model = WaitRoom
        fields = "__all__"
        read_only_fields = ["owner","attendee"]

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = "__all__" 

class TournamentDetailSerializer(serializers.ModelSerializer):
    '''
    Used for detailed view in the getTournament for winnerid
    '''
    winner = CustomUserSerializer(read_only=True)
    
    class Meta:
        model = Tournament
        fields = "__all__" 


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

class ParticipDetailSerializer(serializers.ModelSerializer):
    # Serializer for retrieving Tourparticipation with nested user data
    userid = CustomUserSerializer(read_only=True)  # Nested serializer for the userid field

    class Meta:
        model = Tourparticipation
        fields = "__all__"

class MatchDetailSerializer(serializers.ModelSerializer):
    player1 = CustomUserSerializer(read_only=True)
    player2 = CustomUserSerializer(read_only=True)

    class Meta:
        model = Match
        fields = "__all__"
