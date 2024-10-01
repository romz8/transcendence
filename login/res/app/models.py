from django.db import models, transaction
import uuid
from django.utils import timezone
from datetime import timedelta
from django.core.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)

from django.contrib.auth.models import AbstractUser

class Users(AbstractUser):
    alias = models.CharField(max_length=50, unique=True,blank=False, null=False)
    intra = models.BooleanField(blank=False, null=False)
    campus = models.CharField(max_length=100, blank=True, null=True)
    img = models.ImageField(upload_to='img_profile/', blank=True, null=True)
    intra_id = models.CharField(unique=True, null=True, max_length=50)
    is_ai = models.BooleanField(default=False, null=False, blank=False)

    class Meta:
        managed = True
        db_table = 'users'

    def __str__(self):
        return f"user id {self.id} aka {self.alias}" 

class UserStatus(models.Model):
    users = models.OneToOneField(Users, primary_key=True, on_delete=models.CASCADE)
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)

    class Meta:
        managed = True
        db_table = 'userstatus'

class Friends(models.Model):
    id = models.AutoField(primary_key=True)
    usersid1 = models.ForeignKey(Users, on_delete=models.CASCADE, db_column='usersid1', related_name='friends_as_user1', null=False)
    usersid2 = models.ForeignKey(Users, on_delete=models.CASCADE, db_column='usersid2', related_name='friends_as_user2', null=False)
    pending = models.BooleanField(blank=False, null=False, default=True)

    class Meta:
        managed = True
        db_table = 'friends'
        unique_together = ('usersid1', 'usersid2')

    def __str__(self):
        return f'{self.usersid1} - {self.usersid2}'

class Tournament(models.Model):
    STATE_CHOICES = [('registering', 'Registering'),('ongoing', 'Ongoing'),('finished', 'Finished')]
    
    winner = models.ForeignKey(Users, models.DO_NOTHING, db_column='winnerid', blank=True, null=True, related_name="winner")
    runner_up = models.ForeignKey(Users, models.DO_NOTHING, db_column='runneruprid', blank=True, null=True, related_name="loser")
    final_score = models.CharField(max_length=100, null=True, blank=True)
    datetourn = models.DateTimeField(auto_now_add=True, blank=False, null=False)
    state = models.CharField(max_length=50, default="registering", choices=STATE_CHOICES)
    size = models.IntegerField(default=4, choices=[(4,'4'),(8, '8')])
    n_registered = models.IntegerField(default=0)
    n_humans = models.IntegerField(default=1)
    hexblock = models.CharField(max_length=100, blank=True, null=True)
    genId = models.CharField(max_length=100, unique=True, editable=False)

    class Meta:
        managed = True
        db_table = 'tournament'

    def __str__(self):
        return f"Tournament id {self.pk} with {self.n_registered} / {self.size} - state {self.state}"
    
    def clean(self):
        if self.n_registered > self.size:
            raise ValidationError(f"tournament is full")

    def save(self, *args, **kwargs):
        self.clean()
        if not self.genId:
            self.genId = self.generate_unique_id()
        super(Tournament,self).save(*args, **kwargs)
    
    def generate_unique_id(self):
        while True:
            temp = "T_" + uuid.uuid4().hex[:10]
            if not Tournament.objects.filter(genId=temp).exists():
                return temp


class Tourparticipation(models.Model):
    userid = models.ForeignKey(Users, models.CASCADE, db_column='usersid', blank=False, null=False)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, db_column='tournamentid')
    is_eliminated = models.BooleanField(default=False)

    class Meta:
        managed = True
        db_table = 'tourparticipation'
        unique_together = ['userid','tournament']
    
    def clean(self):
        if Tourparticipation.objects.filter(userid=self.userid, tournament=self.tournament).exists():
            raise ValidationError("You are already registered to this tournament")

    @transaction.atomic
    def save(self, *args, **kwargs):
        if self.pk is None:
            tourn = Tournament.objects.select_for_update().get(pk=self.tournament.pk)
            if tourn.state != "registering":
                raise ValidationError(f"Cannot join the tournament because it is {tourn.state}")
            if tourn.n_registered >= tourn.size:
                raise ValidationError(f"cannot join the tournament, it is full")
            self.clean()
            super(Tourparticipation, self).save(*args, **kwargs) #saving before updating total participant and potential state change
            tourn.n_registered += 1 #if no primary key, i.e. if instance is newed and participation is being created only 
            tourn.save()
        else:
            super(Tourparticipation, self).save(*args, **kwargs)

class Match(models.Model):
    STATE_CHOICES = [('waiting', 'Waiting'),('playing', 'Playing'),('finished', 'Finished')]
    player1 = models.ForeignKey(Users, related_name = "game_player1",on_delete=models.SET_NULL, null=True)
    player2 = models.ForeignKey(Users, related_name = "game_player2", on_delete=models.SET_NULL, null=True)
    game_date = models.DateTimeField(auto_now_add=True)
    score_p1 = models.IntegerField(default=0)
    score_p2 = models.IntegerField(default=0)
    state = models.CharField(max_length=100, default="waiting", choices=STATE_CHOICES)
    game_id = models.CharField(max_length=36, unique=False, editable=False) #ISSUE FOR TOURNAMENT AT CREATION IF NOT TURNED OFF
    #used four tournament only
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, db_column = "tournamentid", blank=True, null=True)
    round=models.IntegerField(default=0, null=True, blank=True)
    next_match = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"Game id {self.pk} between {self.player1} and {self.player2} on {self.game_date}"

    class Meta:
        managed=True
        db_table = 'match'
        ordering = ['game_date']
        unique_together = ["player1", "player2", "game_date", "tournament"]
    
    def clean(self):
        # Allow both players to be None (future matches in Tourbament Sequence)
        if self.player1 is None and self.player2 is None and self.tournament is not None:
            return
        if (self.player1 == self.player2):
            raise ValidationError("impossible : the 2 players need to be different")

    def save(self, *args, **kwargs):
        self.clean()
        super(Match, self).save(*args, **kwargs)

#needs to be outside of the class to instantiate default value field
def default_expire_at():
    return (timezone.now() + timedelta(minutes=3))

class WaitRoom(models.Model):
    owner = models.ForeignKey(Users, on_delete=models.CASCADE, related_name="owner_room", null=True, blank=True) #for migration, later put it unique
    attendee = models.ForeignKey(Users, on_delete=models.CASCADE, related_name="attending_room", null=True, blank=True)
    genId = models.CharField(max_length=36, unique=True, editable=False)
    expire_at = models.DateTimeField(default=default_expire_at)
    
    class Meta:
        managed=True
        db_table = 'waitroom'
    
    def __str__(self):
        return f"Room {self.genId} (Owner: {self.owner}, Attendee: {self.attendee})"
    
    def cleanGame(self):
        if (self.owner == self.attendee):
            raise ValidationError("impossible : the 2 players need to be different")

    def generate_unique_id(self):
        while True:
            temp = uuid.uuid4().hex
            if not WaitRoom.objects.filter(genId=temp).exists() and not Match.objects.filter(game_id=temp).exists():
                return temp
    
    @transaction.atomic
    def join_room(self, user):
        room = WaitRoom.objects.select_for_update().get(genId=self.genId)
        if room.attendee is not None:
            raise ValidationError("Someone just joined this room")
        room.attendee = user
        room.save()
    
    def save(self, *args, **kwargs):
        if not self.genId:
            self.genId = self.generate_unique_id()
        self.cleanGame()
        super(WaitRoom, self).save()

#used for when a user is deleted
def user_deleted():
    time = timezone.now()
    return ("user_deleted on " + str(time))