from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db.models import UniqueConstraint

class Users(models.Model):
    user = models.ForeignKey(User, null=True, on_delete=models.CASCADE)
    id = models.CharField(primary_key=True, max_length=50)
    alias = models.CharField(max_length=50, blank=False, null=False)
    username = models.CharField(max_length=50, blank=False, null=False)
    intra = models.BooleanField(blank=False, null=False)
    campus = models.CharField(max_length=100, blank=True, null=True)
    name = models.CharField(max_length=30, blank=True, null=True)
    lastname = models.CharField(max_length=140, blank=True, null=True)
    img = models.CharField(max_length=300, blank=False, null=False)
    class Meta:
        managed = True
        db_table = 'users'

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

class Match(models.Model):
    usersid1 = models.ForeignKey('Users', on_delete=models.DO_NOTHING, db_column='usersid1', related_name='match_as_user1')
    usersid2 = models.ForeignKey('Users', on_delete=models.DO_NOTHING, db_column='usersid2', related_name='match_as_user2', blank=True, null=True)
    datamatch = models.DateTimeField(blank=False, null=False)
    score = models.CharField(max_length=5, blank=True, null=True)
    tournamentid = models.ForeignKey('Tournament', models.DO_NOTHING, db_column='tournamentid')

    class Meta:
        managed = True
        db_table = 'match'


class Matchhistorty(models.Model):
    usersid = models.ForeignKey('Users', models.DO_NOTHING, db_column='usersid', blank=False, null=False)
    matchid = models.ForeignKey(Match, models.DO_NOTHING, db_column='matchid', blank=False, null=False)

    class Meta:
        managed = True
        db_table = 'matchhistorty'


class Tournament(models.Model):
    winnerid = models.ForeignKey('Users', models.DO_NOTHING, db_column='winnerid', blank=True, null=True)
    datetourn = models.DateTimeField(blank=False, null=False)
    hexblock = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'tournament'


class Tourparticipation(models.Model):
    usersid = models.ForeignKey('Users', models.DO_NOTHING, db_column='usersid', blank=False, null=False)
    tournamentid = models.ForeignKey(Tournament, models.DO_NOTHING, db_column='tournamentid')

    class Meta:
        managed = True
        db_table = 'tourparticipation'
