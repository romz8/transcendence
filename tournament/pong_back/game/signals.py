# myapp/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Users, Match, Tournament, Tourparticipation
from .tournament import TournamentSerie, MatchNode
from django.db import transaction
import logging, random, requests, os

logger = logging.getLogger(__name__)

#Block_url = os.getenv('API_URL_BLOCKCHAIN')

@receiver(post_save, sender=Match)
def update_match_tournament(sender, instance, **kwargs):
    if instance.state != "finished" or instance.tournament is None:
        return
    try:
        winner = instance.player1 if instance.score_p1 > instance.score_p2 else instance.player2
        if instance.next_match is not None:
            n_match = Match.objects.get(tournament=instance.tournament, id= instance.next_match.id)
            if n_match.state != "waiting":
                return
            if n_match.player1 is None:
                n_match.player1 = winner
            else:
                logger.info(f"adding winner {winner.username} as player 2 in {n_match.id}")
                n_match.player2 = winner
                n_match.state = "playing"
            n_match.save()
        else:
            tourn = Tournament.objects.get(id = instance.tournament.id)
            loser = instance.player1 if (winner == instance.player2) else instance.player2
            tourn.winner = winner
            tourn.runner_up = loser
            tourn.final_score = str(instance.score_p1) + "-" + str(instance.score_p2)
            tourn.state = "finished"
            tourn.save()

    except Match.DoesNotExist:
        logger.info(f"Next match not found in tournament instance for tag {instance.next_match}")
    except Tournament.DoesNotExist:
        logger.info(f"Tournament not found game instance for tag {instance.tournament.id}")
    except Exception as e:
        logger.info(f"Issue in next match allocation " + str(e))

@receiver(post_save, sender=Tournament)
def build_bracket_tournament(sender, instance, created,**kwargs):
    if hasattr(instance, '_signal_handling_in_progress') and instance._signal_handling_in_progress:
        return
    instance._signal_handling_in_progress = True
    if(instance.state == "registering") and (instance.n_registered == instance.size):
        try:
            tour_obj = TournamentSerie(instance.id, instance.size)
            players = Tourparticipation.objects.filter(tournament = instance)
            for p in players:
                tour_obj.player_list.append(p.userid)
            match_mapping = {}
            tour_obj.generate_tournament()
            for m in tour_obj.match_list:
                logger.info(f"*** mapping for  {m.round} : {m.players[0]} - {m.players[1]}****")
                match_instance = create_match(m.players[0], m.players[1], instance, m.round)
                match_mapping[m.id] = match_instance
            for m in tour_obj.match_list:
                if m.next_match:
                    m_instance = match_mapping[m.id]
                    m_instance.next_match = match_mapping[m.next_match.id]
                    if m_instance.player1 and m_instance.player2:
                        m_instance.state = "playing"
                    m_instance.save()
            instance.state = "ongoing"
            instance.save()
        except Exception as e:
            logger.info("Error at bracket generation : " + str(e))
        finally:
            # Step 4: Reset the flag to False after operations are complete
            instance._signal_handling_in_progress = False

# @receiver(post_save, sender=Tournament)
# def save_tournament_blockchain(sender, instance, created, **kwargs):
#     logger.info(f"ENTERING BLOCKCHAIN SAVE TOURNAMENT with block url {Block_url}")
#     if created:
#         return
#     if instance.state != "finished":
#         return
#     payload = { "winner" : instance.winner,
#         "runner_up" : instance.runner_up,
#         "final_score" : instance.final_score,
#         "participant_count" : instance.n_humans } 
#     try:
#         logger.info(f"IT SHOULD SAVE TO BCKCHAIN WITH {payload} BUT WE ARE SAVING GAS")
#         # response = requests.post(Block_url, payload)
#         # if response.status == 200 or response.status == 201:
#         #     logger.info("Tournament result successfully posted to blockchain.")
#         # else:
#         #     logger.error(f"Failed to post tournament result to blockchain. Status code: {response.status_code}, Response: {response.text}")
#     except Exception as e:
#         logger.error(f"Exception occurred while posting to blockchain: {str(e)}")



def create_match(player1, player2, tournament, round):
    """
    Creates a new match between two players and randomizes it if both are AI.
    """
    # Create the match within an atomic transaction
    with transaction.atomic():
        match = Match.objects.create(player1=player1, player2=player2, tournament=tournament, round = round,state='waiting')
    return match

    