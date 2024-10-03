from celery import shared_task
from celery.exceptions import Ignore
from django.utils import timezone
from django.db import transaction
from .models import WaitRoom, Match, Tournament, Tourparticipation
import logging, random

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def clear_expired_waitrooms(self):
    try:
        waitrooms = WaitRoom.objects.all()
        #waitrooms = WaitRoom.objects.filter(attendee=None) - if want to clean only empty ones
        now = timezone.now()
        for waitroom in waitrooms:
            try:
                if now >= waitroom.expire_at:
                    waitroom.delete()
                    logger.info(f"Waitroom {waitroom.id} has expired and has been deleted.")
                else:
                    logger.info(f"Waitroom {waitroom.id} has not yet expired or Not empty. Re-checking in 1 minutes.")    
            except Exception as e:
                logger.error(f"Error checking or clearing waitroom {waitroom.id}: {str(e)}")
    except Exception as e :
        logger.error(f"Error on waitroom queryset search in task clearing: {str(e)}")
        raise e

@shared_task(bind=True)
def manage_full_ai_match(self):
    try:
        tournaments = Tournament.objects.filter(state="ongoing")
        for tournament in tournaments:
            matches = Match.objects.filter(tournament=tournament, state="playing")
            for m in matches:
                try:
                    if m.player1 and m.player2 and m.player1.is_ai and m.player2.is_ai:
                        with transaction.atomic():
                            m.score_p1 = 3 if random.random() < 0.5 else 0
                            m.score_p2 = 0 if m.score_p1 == 3 else 3
                            m.state = "finished"
                            m.save()
                            loser = m.player1 if m.score_p1 == 0 else m.player2
                            particip = Tourparticipation.objects.get(tournament=tournament,userid = loser)
                            particip.is_eliminated=True
                            particip.save()
                except Exception as e:
                    logger.error(f"an Issue occurred in match handling {m.id} Task {str(e)}")
            if tournament.state == "finished":
                self.update_state(state="SUCCESS", meta={'info': 'Tournament is over'})
    except Exception as e:
        logger.error(f"an Issue occurred in Tournament queryet search for AI task : {str(e)}")
        raise e
            
