
import asyncio, logging, random #quit random after refacto
from enum import Enum
import abc
from .game_management import GameManager, ENDSCORE
from game.models import Users, Match, Tournament, Tourparticipation
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)
gamestatus = Enum('gamestatus', ['init', 'waiting', 'playing', 'over', 'quit', 'close'])

class GameObserver(abc.ABC):
    
    @abc.abstractmethod
    def broadcast_update(self, *args, **kwrags): #possible if not sure of variable implemenation ?
        pass

class Room(GameObserver):
    def __init__(self, game_id, channel_layer, mode):
        self.game_id = game_id
        self.channel_layer = channel_layer
        self.players = {}
        self.score = {}
        self.player_display = {} #necesary ?
        self.state = gamestatus.init
        self.ready_players = set()
        self.winner = None
        self.loser = None
        self.start_received = False
        self.direction = 0 #necessary ?
        self.goal = False #necessary ?
        self.tournament_mode = False #change the init logic
        self.goal_messages = 0
        self.game = None
        self.tournament_mode = mode
        self.ENDSCORE = ENDSCORE
        self.disconnect = set()


    def add_player(self, channel_name, user_id, playername):
        if self.state == gamestatus.init:
            self.state = gamestatus.waiting
            role = 'player1'
        elif self.state == gamestatus.waiting:
            if user_id in self.players:
                logger.info("*** == *** adding a player that is actually reconnecting")                                                                                                                                                    
                return 
            self.state = gamestatus.playing
            role =  'player2'  #WE SHOULD NOT ADD A PLAYER IF WE ARE RECONNECTING THEN !! 
        
        self.players[user_id] = {'role': role, 'user_id': user_id, 
        'playername': playername, 'connected' : True, 
        'channel_name': channel_name}
        
        self.score[role] = 0
        if len(self.players) == 2:
            self.player_display = {k['role']: k['playername'] for k in self.players.values()}


    async def disconnect_player(self, user_id):
        if user_id in self.players:
            self.disconnect.add(user_id)
            self.players[user_id]['connected'] = False
            logger.info(f"Player {self.players[user_id]['playername']} marked as disconnected")
        if self.state == gamestatus.playing:
            self.state = gamestatus.quit
            self.loser = self.players[user_id]['role']
            await self.notify_over_quit()
        logger.info(f"Disconnect Storage is {self.disconnect} and game state is {self.state}")
        return (self.state)

    def reconnect_player(self, user_id):
        if self.state == gamestatus.waiting:
            self.players[user_id]['connected'] = True
            self.disconnect.remove(user_id)
            logger.info(f"** reconnect success** Disconnect Storage is {self.disconnect} and players is {self.players}")
            return (True)
        else:
            return (False)

    def get_player_role(self, id):
        if id in self.players:
            return self.players[id]['role']
        return None

    def is_full(self):
        logger.info(f" ***** in isfull mthds we have players {self.players} and discnt {self.disconnect}")
        return len(self.players) >= 2 and len(self.disconnet) == 0

    def create_point(self):
        if self.game is not None:
            self.game.stop = True
            self.game.unregister_observer(self)
        self.game = GameManager(self)

    async def broadcast_update(self, message, event):
        """will see how to handle goal -> add score / change start_point"""
        if self.state in [gamestatus.over, gamestatus.quit]:
            self.game.unregister_observer(self)
            self.game = None
            logger.info(f'**** UNREGISTER GAME INSTANCE FOR QUIT OR OVER ******')
            if self.state == gamestatus.over:
                await self.end_with_winner()
            return
        if message == "update":
            await self.channel_layer.group_send(self.game_id,{
                    'type': 'dispatch_game_state',
                    'roomstate' : self.state.name,
                    'game_state': event,
                    'room_channel':self.game_id,})
        if message == "hit":
            await self.channel_layer.group_send( self.game_id,{
                'type': 'dispatch_hit','event': 'hit',})

        if message == "goal":
            self.score[event] += 1
            for x in self.score.values():
                if x >= self.ENDSCORE:
                    self.state = gamestatus.over
            if self.state == gamestatus.over:
                await self.end_with_winner()
            else:
                await self.channel_layer.group_send(self.game_id,{
                    'type': 'dispatch_goal',
                    'roomstate' : self.state.name,
                    'event': 'goal',
                    'player': event,
                    #'direction': event,
                    'score':self.score,})

            # for x in self.score.values():
            #     if x >= self.ENDSCORE:
            #         self.state = gamestatus.over
    
    async def broadcast_countdown(self):
        logger.info(f"SERVER SENDING COUNTDOWN {self.state.name}")
        await self.channel_layer.group_send(self.game_id,{
                    'type': 'dispatch_countdown',
                    'room_channel': self.game_id,
                    'roomstate' : self.state.name,
                    'players': self.player_display,
                    'event': 'start_countdown',
                    'direction': random.randint(1, 4),})
        self.ready_players.clear()

    def broadcast_reset(self):
        logger.info(f"sending the BROADCAST_RESET message")
        async_to_sync(self.channel_layer.group_send)(self.game_id,{
        'type': 'dispatch_reset','room_channel': self.game_id,
        'roomstate' : self.state.name,'direction': self.direction,})
        self.start_sent = False
        self.goal_messages = 0
    
    async def input_handler(self, data, id):
        event = data.get('event', None)
        sender = self.players.get(id, None)
        if sender is None:
            logger.error(f'===== G_H : PLAYER {id} NOT FOUND IN {self.players}===========')
            return
        if event == 'ready' and self.state != gamestatus.over:
            self.ready_players.add(sender['role'])         
            logger.info(f"{sender['playername']} as {sender['role']} is ready")
            
            if self.ready_players == {'player1', 'player2'}:
                logger.info(f"BOTH PLAYER ARE READY")
                await self.broadcast_countdown()
            return

        if event == 'start':
            self.start_received += 1
            if self.start_received != 2:
                return
            self.start_received = 0
            await self.game.set_game_state()
            asyncio.create_task(self.game.update_game_state()) #is WERE THE SINGLETON LOGIC WILL CHANGE
            return
        
        if event == 'reset':
            self.broadcast_reset()

        if event == 'input':
            await self.game.set_key_state(data)
            return 
    
    
    async def end_with_winner(self):
        '''
        Ends the game when a player wins (reach endscore).
        Updates the game state to reflect that the game is over, assigns the winner 
        and loser, saves the game result to the database, and notifies all players 
        of the game outcome.
        '''
        
        self.winner = [k for k,v in self.score.items() if v >= self.ENDSCORE ][0]
        self.loser = 'player2' if self.winner == 'player1' else 'player1'
        await self.game_to_db()
        logger.info(f"ENDING with WINNER player :{self.winner} with state {self.state}")
        await self.channel_layer.group_send(self.game_id, {
            'type': 'game_over',
            'players': self.player_display,
            'score': self.score,
            'roomstate': self.state.name,
            'winner': self.winner,
            'loser': self.loser,
            })
        logger.info(f'Game state: {self.state.name} - {self.score}')

    async def notify_over_quit(self):
        '''
        Sends a "game over" message to all players.
        This method is used to broadcast the end of the game to all players in the room.
        Ends the game as a forfeit. Updates the game state to reflect that a player has quit, 
        assigns the winner and loser roles, updates the scores, and saves the game result to the database.
        '''
        if self.game:
            self.game.stop = True
        self.winner = 'player1' if self.loser == 'player2' else 'player2'
        self.score[self.loser] = 0
        self.score[self.winner] = self.ENDSCORE
        await self.game_to_db()
        logger.info(f'NOTIFY QUIT with state {self.state } :quitter{self.loser} and winner {self.winner}')
        await self.channel_layer.group_send(self.game_id, {
                'type': 'game_over','score': self.score,
                'winner':self.winner, 'loser':self.loser, 
                'roomstate': self.state.name,})
  


    async def game_to_db(self):
        '''
        This method records the final scores and the participants of the game into the 
        `Match` model. It is called when the game ends, either due to a player winning 
        or forfeiting.
        '''
        logger.info(f"========= SAVING TO DB : {self.game_id} as Tournament :{ self.tournament_mode} and state {self.state} ========")
        
        if self.state not in  [gamestatus.over, gamestatus.quit]:
            return
        user_player = {}
        for user_id, info in self.players.items():
            user_player[info['role']]= {'id' : user_id, 'score' :self.score[info['role']], 'name' : info['playername']}
        if self.tournament_mode:
            try:
                await self.save_tournament_db(user_player)
            except Exception as e:
                logger.error(f"Issue while saving match as tournament game {str(e)}")
        else:
            try:
                user_p1 = await database_sync_to_async(Users.objects.get)(id=user_player['player1']['id'])
                user_p2 = await database_sync_to_async(Users.objects.get)(id=user_player['player2']['id'])
                m = await database_sync_to_async(Match.objects.create)(player1=user_p1, player2=user_p2, \
                score_p1=self.score['player1'], score_p2=self.score['player2'], game_id= self.game_id, state="finished")
                logger.info(f"***** Game SAVED TO DB with id {m.id} - players {m.player1} vs {m.player2} / score : {m.score_p1} - {m.score_p2}")
            except Users.DoesNotExist:
                logger.error("****Error saving game to database: User not found")
       
        
    async def save_tournament_db(self, user_player):
        try:
            inverted = False
            tag, tourid = self.game_id.split("-")
            logger.info(f"*** DB SAVE - TOURNAMENT : {tourid} - tag {tag}")
            tour = await database_sync_to_async(Tournament.objects.get)(id=tourid)
            match = await database_sync_to_async(Match.objects.get)(id = tag, tournament=tour)
            match_player1 = await database_sync_to_async(lambda: match.player1)()
     
            if match_player1.id != user_player['player1']['id']:
                inverted = True
                temp = user_player['player1']
                user_player['player1'] = user_player['player2']
                user_player['player2'] = temp

            match.score_p1 = user_player['player1']['score']
            match.score_p2 = user_player['player2']['score']
            loser = user_player['player1']['id'] if user_player['player1']['score'] < user_player['player2']['score'] else user_player['player2']['id']
            loser_instance = await database_sync_to_async(Users.objects.get)(id=loser)
            match.state="finished"
            match.game_id = self.game_id
            await database_sync_to_async(match.save)()
            loser_particip = await database_sync_to_async(Tourparticipation.objects.get)(userid=loser_instance, tournament=tour)
            loser_particip.is_eliminated = True
            await database_sync_to_async(loser_particip.save)()
        except Match.DoesNotExist:
            raise(f"****Error saving Match of Tournament [404] with tag {tag} - players {user_p1} - {user_p2} in tournament {tour}")
        except Tournament.DoesNotExist:
            raise(f"**** Error saving game to database: Tournament not found with input: {tourid}")
        except Tourparticipation.DoesNotExist:
            raise(f"**** Error saving game to database:Loser not found {loser}")


