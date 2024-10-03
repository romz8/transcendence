from django.urls import path
from . import views

urlpatterns = [
    path("tournament/<int:pk>/match_ai/", views.modify_match_ai, name="matchAi"),
    path("players/", views.player_list, name='player_list'),
    path("allmatch/", views.MatchList.as_view(), name='match_list'),
    path("waitingroom/info/<str:genId>/", views.getWaitRoom.as_view(), name='getWaitroom'),
    path("waitingroom/listopen/", views.ListWaitRoom.as_view(), name='getWaitroom'),
    path("waitingroom/create/", views.createWaitroom.as_view(), name='createWaitroom'),
    path("waitingroom/join/<str:pk>/", views.join_waitroom, name='joinWaitroom'),
    path("waitingroom/delete/<str:pk>/", views.delete_waitroom, name='deleteWaitroom'),
    path("tournament/create/", views.create_tournament, name='createTournament'),
    path("tournament/join/<str:pk>/", views.join_tournament, name='joinTournament'),
    path("tournament/openlist/", views.TournamentsOpen.as_view(), name='ListTournamentOpen'),
    path("tournament/<int:pk>/", views.SingleTournament.as_view(), name='getTournament'),
    path("tournament/<int:pk>/participants/", views.TournamentPlayerList.as_view(), name="playersTournament"),
    path("tournament/<int:pk>/matches/", views.TournamentMatchList.as_view(), name="matchesTournament"),
    path("tournament/<int:pk>/is_active/", views.UserMatchStatusView.as_view(), name="matchesTournament"),
    path('participants/eliminate/', views.UpdateParticipantStatus.as_view(), name='update-participant-status'),
    path('tournament/test/match/<int:id>/', views.RandomMatch.as_view(), name='randomizedTest'),
    path('tournament/leave/<int:tournament_id>/', views.QuitTournament.as_view(), name='quitTournament'),
]