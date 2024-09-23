
from enum import Enum

gamestatus = Enum('gamestatus', ['init', 'waiting', 'playing', 'over', 'quit', 'close'])

class Room:
    def __init__(self, game_id):
        self.game_id = game_id
        self.players = {}
        self.score = {}
        self.player_display = {}
        self.state = gamestatus.init
        self.connected = 0
        self.ready_players = set()
        self.winner = None
        self.loser = None
        self.start_received = False
        self.direction = 0
        self.goal = False
        self.goal_messages = 0
        self.game = None


    def add_player(self, channel_name, role, user_id, playername):
        self.players[channel_name] = {'role': role, 'user_id': user_id, 'playername': playername}
        self.connected += 1
        if self.connected == 2:
            self.player_display = {k['role']: k['playername'] for k in self.players.values()}


    def remove_player(self, channel_name):
        if channel_name in self.players:
            del self.players[channel_name]
            self.connected -= 1

    def get_player_role(self):
        if self.state == gamestatus.init:
            self.state = gamestatus.waiting
            return 'player1'
        elif self.state == gamestatus.waiting:
            self.state = gamestatus.playing
            return 'player2'
        return None

    def is_full(self):
        return self.connected >= 2
