from django.shortcuts import render
from django.views.generic import ListView
from .models import Users, Match, WaitRoom, Tournament, Tourparticipation
from .serializer import CustomUserSerializer, MatchSerializer, MatchDetailSerializer, RoomSerializer, RoomDetailSerializer, TournamentSerializer, TournamentDetailSerializer, ParticipSerializer, ParticipDetailSerializer
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import Http404, JsonResponse
from rest_framework import status
from django.db import transaction
from rest_framework.exceptions import ValidationError, NotFound
import logging, uuid, random
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView, UpdateAPIView, DestroyAPIView
import json

logger = logging.getLogger(__name__)

# Create your views here.

#added from tuto
from django.http import HttpResponse

# /////////////////////////////////////////////////

@api_view(["POST"])
def modify_match_ai(request, pk):
    try:
        match = get_object_or_404(Match, id=pk)
        if match.state == 'finished':
            return(Response({"error": "Match already done"}, status=status.HTTP_400_BAD_REQUEST))
        body = json.loads(request.body.decode('utf-8'))
        score_ai = body.get('score_ai')
        score_user = body.get('score_user')
        user = request.user
        if match.player1 == user:
            match.score_p1 = score_user
            match.score_p2 = score_ai
            match.state = 'finished'
            match.save()
            ai = match.player2
        elif match.player2 == user:
            match.score_p2 = score_user
            match.score_p1 = score_ai
            match.state = 'finished'
            match.save()
            ai = match.player1
        else:
            return(Response({"error": "Match not Found"}, status=status.HTTP_400_BAD_REQUEST))
        if score_user < score_ai:
            tour = match.tournament
            parti = Tourparticipation.objects.get(userid=user,tournament=tour)
            parti.is_eliminated = True
        else:
            tour = match.tournament
            parti = Tourparticipation.objects.get(userid=ai,tournament=tour)
            parti.is_eliminated = True
        parti.save()
    except Exception as e:
        return (Response({"error":str(e)}, status=status.HTTP_400_BAD_REQUEST))
    return JsonResponse({"status": pk})

# /////////////////////////////////////////////////


@api_view(["GET", "POST"])
def player_list(request):
    if request.method == "GET":
        profiles = Users.objects.all()
        serialized = CustomUserSerializer(profiles, many=True)
        return Response(serialized.data)
    
    elif request.method == "POST":
        deserialized = CustomUserSerializer(data=request.data)
        if deserialized.is_valid():
            deserialized.save()
            return (Response(deserialized.data, status=status.HTTP_201_CREATED))
        else:
            return(Response(deserialized.errors, status=status.HTTP_400_BAD_REQUEST))
        

class MatchList(ListAPIView):
    serializer_class = MatchDetailSerializer

    def get_queryset(self):
        player = self.request.user
        return (Match.objects.filter(player1=self.request.user) | Match.objects.filter(player2=self.request.user))

class createWaitroom(CreateAPIView):
    queryset = WaitRoom.objects.all()
    serializer_class = RoomSerializer

    def perform_create(self, serializer):
        owner = self.request.user
        serializer.save(owner=owner,attendee=None)


class getWaitRoom(RetrieveAPIView):
    '''
    return a room instance per its genId
    '''
    queryset = WaitRoom.objects.all()
    serializer_class = RoomDetailSerializer
    lookup_field = "genId"




class ListWaitRoom(ListAPIView):
    queryset = WaitRoom.objects.all().filter(attendee=None)
    serializer_class = RoomSerializer

@api_view(['PUT'])
def join_waitroom(request, pk):
    try:
        room = get_object_or_404(WaitRoom, genId=pk)
        match = room.join_room(request.user)
        serialized = MatchSerializer(match)
        return (Response(serialized.data, status=status.HTTP_201_CREATED))
    except ValidationError as e:
        return (Response({"error":str(e)}, status=status.HTTP_400_BAD_REQUEST))
    except Exception as e:
        return (Response({"error":str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR))

@api_view(['DELETE'])
def delete_waitroom(request, pk):
    logger.info("HOLA")
    room = get_object_or_404(WaitRoom, genId=pk)
    if room.owner != request.user:
        return(Response(status=status.HTTP_401_UNAUTHORIZED))
    room.delete()
    logger.info("ADIOS")
    return (Response(status=status.HTTP_204_NO_CONTENT))

@api_view(['POST'])
def create_tournament(request):
    try:
        logger.info(f"REQUEST CREATE TOURN DATA IS : {request.data}")
        n_h = request.data.get("n_humans", 1)
        size = request.data.get("size", 4)
        if Tourparticipation.objects.filter(userid=request.user, tournament__state='ongoing').exists(): #COULD BE REPLACED BY NOT FINISHED
            return Response({"error": "You cannot create a new tournament while participating in another one."}, status=status.HTTP_406_NOT_ACCEPTABLE)
        if Tourparticipation.objects.filter(userid=request.user, tournament__state='registering').exists():
            return Response({"error": "You are already in a tournament waiting room"}, status=status.HTTP_406_NOT_ACCEPTABLE)
        tourn = Tournament.objects.create(n_humans=n_h, size=size)
        partip = Tourparticipation.objects.create(userid = request.user, tournament=tourn)
        fill_with_ai(tourn.id)
        result = Tournament.objects.get(pk=tourn.id)
        serialized = TournamentSerializer(result)
        return(Response(serialized.data, status=status.HTTP_201_CREATED))
    except Exception as e:
        logger.info(f"issue in API tournament POST" +  str(e))
        return (Response(str(e), status=status.HTTP_400_BAD_REQUEST))

@api_view(['POST'])
def join_tournament(request, pk):
    try:
        tourn = get_object_or_404(Tournament, id=pk)
        data = {
            'userid': request.user.id,
            'tournament': tourn.id,
            'is_eliminated': False
        }
        serialized = ParticipSerializer(data=data)
        if serialized.is_valid():
            serialized.save()
            return (Response(serialized.data, status=status.HTTP_201_CREATED))
        else:
            return Response(serialized.errors, status=status.HTTP_400_BAD_REQUEST)
    except Http404:
        return Response({"error": "Tournament not found."}, status=status.HTTP_404_NOT_FOUND)
    except ValidationError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error joining tournament: {str(e)}")
        return Response({"error": "An unexpected error occurred. {}".format(str(e))}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TournamentsOpen(ListAPIView):
    queryset = Tournament.objects.all().filter(state="registering")
    serializer_class = TournamentSerializer

class SingleTournament(RetrieveAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentDetailSerializer

class TournamentPlayerList(ListAPIView):
    '''
    get the list of players registered to tournament and status 
    we can't use generic queryset and neet to overwrite it
    '''
    serializer_class = ParticipDetailSerializer

    def get_queryset(self):
        tourId = self.kwargs['pk']
        return Tourparticipation.objects.filter(tournament=tourId)

class TournamentMatchList(ListAPIView):
    serializer_class = MatchDetailSerializer

    def get_queryset(self):
        tourid = self.kwargs['pk']
        return Match.objects.filter(tournament=tourid)

class UpdateParticipantStatus(UpdateAPIView):
    queryset = Tourparticipation.objects.all()
    serializer_class = ParticipSerializer

    def get_object(self):
        user_id = self.request.data["userid"]
        tourn_id = self.request.data["tournament"]
        
        try:
            Target = Tourparticipation.objects.get(tournament=tourn_id, userid=user_id)
            if Target.tournament.state != "ongoing":
                raise ValidationError("cannot eliminate the player, not playing yet")
        except Tourparticipation.DoesNotExist:
            raise NotFound("Participant not found in the specified tournament.")
        return Target
    
    def put(self, request, *args, **kwargs):
        target = self.get_object()
        target.is_eliminated=True
        target.save()
        logger.info(f"we just saved {target.userid.username} for tourn {target.tournament.id} with status {target.is_eliminated}")

        serialized = ParticipSerializer(target)
        return (Response(serialized.data, status=status.HTTP_200_OK))

class QuitTournament(DestroyAPIView):
    serializer_class = ParticipSerializer
    lookup_field = 'tournament_id'

    def get_queryset(self):
        try:
            tour_id = self.kwargs.get('tournament_id')
            tour = Tournament.objects.get(pk=tour_id)
            return Tourparticipation.objects.filter(userid=self.request.user, tournament=tour).first()
        except Tournament.DoesNotExist:
            logger.info(f"tournament not found in leave for user {self.request.user}")
            raise ValidationError("Cannot find the tournament")
    
    def get_object(self):
        """Ensure the tournament is in the "registering" state, call the parent class's get_object() method 
        to retrieve the Tourparticipation instance, then perform Additional check: """
        obj = self.get_queryset()
        if obj.tournament.state != "registering":
            raise ValidationError(f"Cannot leave the tournament because it is in state {obj.tournament.state}")    
        return obj
        
    @transaction.atomic
    def perform_destroy(self, instance):
        try:
            tournament = Tournament.objects.select_for_update().get(id = instance.tournament.id)
            tournament.n_registered -= 1
            if not self.request.user.is_ai :
                tournament.n_humans -= 1
            tournament.save()
            instance.delete()
            
            # Check if there are no participants left in the tournament
            if Tourparticipation.objects.filter(tournament=tournament, userid__is_ai=False).count() == 0:
                logger.info(f"Deleting tournament {tournament.id} as there are no participants left.")
                if tournament.state == "registering":
                    tournament.delete()
        except Exception as e:
            logger.info(f"An error occur while leaving tournamet" + str(e))
            raise ValidationError("Cannot leave the tournament, an error occured" + str(e))
            


class RandomMatch(APIView):
    '''
    for test only : randomize win or lose in a match
    '''
    def patch(self, request, *args, **kwargs):
        try:
            match_id = self.kwargs.get('id')
            m = get_object_or_404(Match, pk = match_id)
            r = random.random()
            if r < 0.5:
                m.score_p1 = 3
                m.score_p2 = 0
            else:
                m.score_p1 = 0
                m.score_p2 = 3
            m.state = "finished"
            m.save()
            serialized = MatchSerializer(m)
            user_p1 = User.objects.get(id=m.player1.id)
            user_p2 = User.objects.get(id=m.player2.id)
            if m.score_p1 < m.score_p2:
                    loser = user_p1
            else:
                loser = user_p2
            loser = Tourparticipation.objects.get(userid=loser, tournament=m.tournament)
            loser.is_eliminated = True
            loser.save()
            return Response(serialized.data, status = status.HTTP_200_OK)
        except Http404:
            logger.info(f"can't find the match for id {match_id}")


class UserMatchStatusView(APIView):

    def get(self, request, *args, **kwargs):
        try:
            # Fetch tournament and user
            tournament_id = self.kwargs.get('pk')
            tournament = get_object_or_404(Tournament, pk=tournament_id)
            user = self.request.user
            if tournament.state == "finished":
                if tournament.winner == user:
                    is_winner = True
                else:
                    is_winner = False
                return Response({"status": "game_over","winner": is_winner},status=status.HTTP_200_OK)
            # Check if the user is participating in this tournament
            participation = Tourparticipation.objects.filter(
                tournament=tournament, userid=user
            ).first()

            if not participation:
                return Response({"status": "not_registered"},status=status.HTTP_200_OK)

            # Check if the user is eliminated
            if participation.is_eliminated:
                return Response({"status": "eliminated"}, status=status.HTTP_200_OK)

            # Check if the user has an active match
            active_match = Match.objects.filter(tournament=tournament).filter(player1=user, state="playing").first() or Match.objects.filter(
                tournament=tournament,player2=user,state="playing").first()
            logger.info(f"we found user in match : {active_match} in tournament {tournament}")

            if active_match:
                if active_match.player2 is not None and active_match.player1 == user:
                    opponent = active_match.player2.username
                    is_ai = active_match.player2.is_ai
                elif active_match.player1 is not None and active_match.player2 == user:
                    opponent = active_match.player1.username
                    is_ai = active_match.player1.is_ai
                msg = {
                    "status": "match_to_play",
                    "match_id": active_match.id,
                    "opponent": opponent,
                    "is_ai": is_ai
                }
            else:
                return Response({"status": "waiting_for_next_match"}, status=status.HTTP_200_OK)
            return Response(msg, status=status.HTTP_200_OK)
        except Tournament.DoesNotExist:
            logger.error("Tournament not found for ID: %s", self.kwargs.get('pk'))
            return Response({"error": "Tournament not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Unexpected error in UserMatchStatusView: {str(e)}")
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#************ UTILS FOR TOURNAMENT AND AI CREATION **********************/
def fill_with_ai(tourn_id):
    try:
        logger.info("======================= executting fill_w_ai")
        id = Tournament.objects.get(pk=tourn_id)
        ai_needed = id.size - id.n_humans
        ai_registered = set()
        ai_profiles = Users.objects.filter(is_ai=True).distinct()
        ai_count = ai_profiles.count()
        logger.info(f"TOTAL NUMBER OF AI is {ai_count} and we need {ai_needed}")
        if ai_count < ai_needed:
            n_create = ai_needed - ai_count
            logger.info(f"we need to create {n_create} AI")
            for _ in range(n_create):
                temp_name = "AI_" + uuid.uuid4().hex[:10]
                temp_alias = "HAL_" + uuid.uuid4().hex[:10]
                ai = Users.objects.create(username=temp_name, intra=False, alias=temp_alias, is_ai=True)
                logger.info(f"**** LOOP AI CREATION {_}, ai name {temp_name} now queryset is {ai_profiles.count()}")
        # Register AI players to fill the tournament
        ai_list = [x.alias for x in ai_profiles]
        logger.info(f"******** now the list of ai is {ai_list}")
        for ai in ai_profiles.iterator():
            logger.info(f"================= ENTER AI PROFILE LOOP, registered ai is {len(ai_registered)}")
            if len(ai_registered) >= ai_needed:
                break
            ai_registered.add(ai)
            logger.info(f"================= ADD AI {ai.alias}")
            Tourparticipation.objects.create(userid=ai, tournament=id)
        logger.info(f"========== all players registered ==============")
    except Http404:
        logger.info("TOURNAMENT NOT FOUND FOR AI CREATION")
    except Exception as e:
        # Handle exceptions to ensure any error is reported
        logger.info(f"An error occurred: {str(e)}")
