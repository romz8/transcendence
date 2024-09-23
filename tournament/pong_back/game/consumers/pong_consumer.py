from channels.generic.websocket import AsyncWebsocketConsumer
from .rooms import Room, gamestatus
from game.models import WaitRoom, Users, Match, Tourparticipation, Tournament
import logging
import asyncio
import random
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync
import json
from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import UntypedToken
#from django.contrib.auth.models import User
from .game_management_mixin import GameManager, init, ENDSCORE

logger = logging.getLogger(__name__)

'''
    asynchronous WebSocket consumer that manages the lifecycle of the pong game

    Attributes:
        rooms (dict): A class-level dictionary to track active game rooms.
    '''
class PongConsumer(AsyncWebsocketConsumer):
    rooms = {}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.game_id = None
        self.room = None
        self.role = None
        self.playername = None
        self.room_group_name = None
        self.score = 0
        self.active = False
        self.tournament_mode = False

    def display(self):
        for room_id, room in PongConsumer.rooms.items():
            logger.info('*************** Room Display **********************')
            logger.info(f'Room: {room_id}')
            logger.info(f'Players: {room.players}')
            logger.info(f'score is : {room.score}')
    
    async def connect(self):
        '''
        Handles a new WebSocket connection.
        Steps:
        1. Validates user authentication, 
        2. the game ID from the URL route.
        3. Attempts to retrieve the corresponding `WaitRoom` object from the database.
        3.b. if not, check that comes from a tournametn (0x game_id)
        4. Checks if the game room already exists or creates a new one.
        5. Verifies if the user is already in the game or if the game room is full.
        6. Assigns the player a role and sets up the game state.
        7. Adds the player to the room and sends initialization data to the frontend.
        '''
        user = self.scope.get('user', None)
        if user is None or not user.is_authenticated:
            self.close_with_error(4000, 'User not authenticated')
            return
        self.user = user
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = f'{self.game_id}'
        try :
            if (self.game_id.startswith("game_")):
                waitroom = await database_sync_to_async(WaitRoom.objects.get)(genId=self.game_id)
            elif (self.game_id.startswith("T_")):
                self.tournament_mode = True
                tour = await database_sync_to_async(Tournament.objects.get)(id=self.game_id.split("-")[1])
            else:
                await self.close_with_error(4001, 'not coming from game nor tournament')
        except WaitRoom.DoesNotExist:
            await self.close_with_error(4001, 'Waitroom for Game not found')
            return
        except Tournament.DoesNotExit:
            await self.close_with_error(4001, 'Tournament for Game not found')
            return

        if self.game_id not in PongConsumer.rooms: 
            PongConsumer.rooms[self.game_id] = Room(self.game_id)
        self.room = PongConsumer.rooms[self.game_id]
        if self.room.game is None:
            self.room.game = GameManager(self.room, self.room_group_name, self.channel_layer)
        
        if self.user.id in [player['user_id'] for player in self.room.players.values()]:
            await self.close_with_error(4002, 'User already in the game')
            await self.close(code=4002)
            return

        if self.room.is_full():
            await self.close_with_error(4003, 'Game is full - limit is 2 players')
            return

        self.role = self.room.get_player_role()
        if not self.role:
            await self.close_with_error(4004, 'Game is full - all players roles are taken')
            return
        
        self.room.score[self.role] = 0
        await self.accept()
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        self.active = True
        self.playername = await self.get_player()
        self.room.add_player(self.channel_name, self.role, self.user.id, self.playername)
        await self.send(text_data=json.dumps({
            'type':gamestatus.init.name,
            'role': self.role,
            'playerName': self.playername,
            'init': init,
        }))
        logger.info("=================================================================")
        logger.info(f"CONNECTION MADE IN {self.game_id} from player {self.room.players[self.channel_name]}")
        logger.info(f"GAME_ID : {self.game_id} and room_group_name: {self.room_group_name} and CHANNEL NAME : {self.channel_name}")
        logger.info("=================================================================")
        self.display()

    async def disconnect(self, close_code):
        '''
        Handles WebSocket disconnection.
        Depending on the current game state, either ends the game as a forfeit (if 
        the game is in progress) or closes the game room. It also notifies all players 
        of the disconnection and cleans up the room if empty.
        '''
        if self.room.state == gamestatus.playing:
            await self.end_game_quit()
        else:
            self.room.state = gamestatus.close

        if self.channel_name in self.room.players:
            self.room.remove_player(self.channel_name)
        
        await self.notify_over_quit()
        await self.cleanup_room()

    async def end_game_quit(self):
        '''
        Ends the game as a forfeit. Updates the game state to reflect that a player has quit, 
        assigns the winner and loser roles, updates the scores, and saves the game result to the database.
        '''
        self.room.state = gamestatus.quit
        self.room.loser = self.role
        self.room.winner = 'player1' if self.role == 'player2' else 'player2'
        self.room.score[self.room.loser] = 0
        self.room.score[self.room.winner] = ENDSCORE
        await self.game_to_db()
        logger.info('Game ended with quit')
    
    async def cleanup_room(self):
        '''
        if room is empty, deletes the room and removes it from the class-level dictionary.
        if Waitroom id exists, deletes the waitroom
        concept : wheter player 1 is quitting or player 2 is quitting, the room will be deleted
        '''
        if self.room.connected == 0 and self.game_id in PongConsumer.rooms:
            try:
                if not self.tournament_mode:
                    waitroom = await database_sync_to_async(WaitRoom.objects.get)(genId=self.game_id)
                    await database_sync_to_async(waitroom.delete)()
            except WaitRoom.DoesNotExist:
                logger.error(f'Waitroom {self.game_id} does not exist')
            del PongConsumer.rooms[self.game_id]
            logger.info(f'********** Room {self.game_id} deleted')
        self.display()

    async def receive(self, text_data):
        data = json.loads(text_data)
        #logger.info(f'Received message: {data}from player: {self.role}')

        if 'logout' in data and data['logout'] == True:
            logger.info('Logout received')
            await self.disconnect(4005)
            return
        
        await self.game_handler(data)

    async def game_handler(self, data):
        event = data.get('event', None)
        if event == 'ready' and self.room.state != gamestatus.over:
            self.room.ready_players.add(self.role)         
            logger.info(f"Player {self.role} is ready")
            
            if self.room.ready_players == {'player1', 'player2'}:
                logger.info('both clients are ready!')
                await self.channel_layer.group_send(self.room_group_name,{
                    'type': 'broadcast_countdown',
                    'room_channel': self.room_group_name,
                    'roomstate' : self.room.state.name,
                    'players': self.room.player_display,
                    'event': 'start_countdown',
                    'direction': random.randint(1, 4),
                }   
                ) 
                self.room.ready_players.clear()
            return

        if event == 'start':
            self.room.start_received += 1
            
            if self.room.start_received != 2:
                return
            
            self.room.start_received = 0
            await self.room.game.set_game_state()
            asyncio.create_task(self.room.game.update_game_state())
            return
        
        if event == 'reset':
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'broadcast_reset',
                    'room_channel': self.room_group_name,
                    'roomstate' : self.room.state.name,
                    'direction': self.room.direction,
                }
            )
            self.room.start_sent = False
            self.room.goal_messages = 0

        if event == 'update':
            await self.room.game.send_updates()

        if event == 'input':
            await self.room.game.set_key_state(data)
            return 
        if self.room.state == gamestatus.over:
            await self.end_with_winner()

    ''''
    ******************* BRODCAST METHODS ****************
    '''

    """  ============================ NEWLY ADDED BEFORE WAS IN GAMEMANAGER ============================== """
    async def broadcast_countdown(self, event):
        """
        NEWLY ADDED BEFORE WAS IN GAMEMANAGER
        Broadcasts a Countdown event to all players in the room. they then alert the front socket
        - Extracts the event type from the incoming event data and sends it as a JSON message to all clients.
        - This function is used for broadcasting general game-related events that do not require specific game state updates
        such as notifications or simple status changes.
        """        
        data = event['event']
        roomstate = event['roomstate']
        players = event['players']
        self.direction = event['direction']
        await self.send(text_data=json.dumps({
            'type': data,
            'roomstate' : roomstate,
            'players': players,
            'direction': self.room.game.direction,
        }))
    
    async def broadcast_game_state(self, event):
        """
        Handler for the broadcast of the current game state to all players in the room.
        - Extracts the `game_state` from the incoming event and sends it to the WebSocket clients.
        - Sends a JSON message containing the positions of the paddles (`leftPad`, `rightPad`) and the ball (`ballX`, `ballY`).
        - Ensures that all clients update their game views according to the latest game state received from the server.
        """

        game_state = event['game_state']
        room_id = event['room_channel']
        leftPad = game_state['leftPad']
        rightPad = game_state['rightPad']
        ballX = game_state['ballX']
        ballY = game_state['ballY']
        roomstate = event['roomstate']
        await self.send(text_data=json.dumps({
            'type': 'update',
            'room_channel': room_id,
            'roomstate': roomstate,
            'leftPad': leftPad,
            'rightPad': rightPad,
            'ballX': ballX,
            'ballY': ballY,
        }))

    async def broadcast_goal(self, event):
        """
        Broadcasts a goal event to all players, indicating which player scored and the new direction of the ball.

        - Extracts the player who scored and the new ball direction from the incoming event.
        - Sends a JSON message containing the player who scored and the direction for the next round.
        - Ensures that all players are aware of the goal and prepares them for the next round of play.
        """
        logger.info(f"Send message: {event['event']} to {self.role}")
        roomstate = event['roomstate']
        data = event['event']
        player = event['player']
        direction = event['direction']
        score = event['score']
        await self.send(text_data=json.dumps({
            'type': data,
            'roomstate': roomstate,
            'player': player,
            'direction': direction,
            'score' : score,
        }))
    async def broadcast_reset(self, event):
        """
        Broadcasts a reset event to all players after a goal is scored.   
        - Sends a reset message to all connected clients to inform them that the game state is being reset for the next round.
        - This function helps synchronize the clients by ensuring they are all prepared for the next game state after a goal.
        """
        direction = event['direction']
        roomstate = event['roomstate']
        await self.send(text_data=json.dumps({
            'type': 'reset',
            'state': roomstate,
        }))

    async def broadcast_hit(self, event):
        """
        Broadcasts a reset event to all players after a goal is scored.   
        - Sends a reset message to all connected clients to inform them that the game state is being reset for the next round.
        - This function helps synchronize the clients by ensuring they are all prepared for the next game state after a goal.
        """
        await self.send(text_data=json.dumps({
            'type': 'hit',
        }))

    """  ============================ END ******* NEWLY ADDED BEFORE WAS IN GAMEMANAGER ============================== """
    async def notify_over_quit(self):
        '''
        Sends a "game over" message to all players.
        This method is used to broadcast the end of the game to all players in the room.
        '''
        await self.channel_layer.group_send(
            self.room_group_name, {
                'type': 'game_over',
                'sender': self.playername,
                'score': self.room.score,
                'roomstate': self.room.state.name,
            })

    async def end_with_winner(self):
        '''
        Ends the game when a player wins (reach endscore).
        Updates the game state to reflect that the game is over, assigns the winner 
        and loser, saves the game result to the database, and notifies all players 
        of the game outcome.
        '''
        logger.info(f"ENDING with WINNER player :{self.role} with state {self.room.state}")
        self.room.winner = self.role
        self.room.loser = 'player2' if self.role == 'player1' else 'player1'
        await self.game_to_db()
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'game_over',
            'sender': self.playername,
            'players': self.room.player_display,
            'score': self.room.score,
            'roomstate': self.room.state.name,
            'winner': self.room.winner,
            'loser': self.room.loser,})
        logger.info(f'Game state: {self.room.state.name} - {self.room.score}')
        
    async def game_over(self, event):
        '''
        Handles the "game over" event and notifies the client.
        This method sends the game result (winner, loser, final scores) to the client, 
        depending on the game state and then cleans up by discarding the channel layer 
        group and closing the WebSocket connection.
        '''
        try:
            player = event['sender']
            score = event['score']
            roomstate = event['roomstate']
            winner = None
            loser = None
            match roomstate:
                case 'over':
                    winner = event['winner']
                    loser = event['loser']
                    message = f'Game over: {winner} won with score {score[winner]} - {loser} lost with score {score[loser]}'
                case 'quit':
                    message = f'{player} quit the game'
                case 'close':
                    message = f'{player} left the room before starting the game'
                case _:
                    message = 'Unknown state'                
            logger.info("IN game_over message will be" + message)

            await self.send(text_data=json.dumps({
                'player': player,
                'score': score,
                'roomstate': roomstate,
                'winner': winner,
                'loser': loser,
                'message': message,
            }))
        except Exception as e:
            logger.error(f"Error sending game_over message: {e}")

        finally:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            await self.close(code=4006)
    
    '''
    **************** UTILS METHODS ****************
    '''
    async def game_to_db(self):
        '''
        This method records the final scores and the participants of the game into the 
        `Match` model. It is called when the game ends, either due to a player winning 
        or forfeiting.
        '''
        logger.info("=================================================================")
        logger.info(f"SAVING TO DB IN {self.game_id}")
        logger.info(f"GAME_ID : {self.game_id} and room_group_name: {self.room_group_name} and CHANNEL NAME : {self.channel_name}")
        logger.info("=================================================================")
        if self.room.state not in  [gamestatus.over, gamestatus.quit]:
            return
        db_state = "finished" 
        for p in self.room.players:
            if self.room.players[p]['role'] == 'player1':
                p1 = self.room.players[p]['user_id']
            else:
                p2 = self.room.players[p]['user_id']
        try:
            user_p1 = await database_sync_to_async(Users.objects.get)(id=p1)
            user_p2 = await database_sync_to_async(Users.objects.get)(id=p2)

            if self.tournament_mode:
                tag_t, tourid = self.game_id.split("-")
                tag = tag_t[2:]
                logger.info(f"********** DB SAVE - TOURNAMENT : {tourid} - tag {tag}")
                tour = await database_sync_to_async(Tournament.objects.get)(id=tourid)
                match = await database_sync_to_async(Match.objects.get)(id = tag, tournament=tour)
                match_player1 = await database_sync_to_async(lambda: match.player1)()
                if match_player1 == user_p1:
                    match.score_p1=self.room.score['player1']    
                    match.score_p2=self.room.score['player2']
                    loser = user_p1 if self.room.score['player1'] < self.room.score['player2'] else user_p2
                else:
                    match.score_p1=self.room.score['player2']
                    match.score_p2=self.room.score['player1']
                    loser = user_p2 if self.room.score['player2'] < self.room.score['player1'] else user_p1
                match.state=db_state
                
                await database_sync_to_async(match.save)()
                loser = await database_sync_to_async(Tourparticipation.objects.get)(userid=loser, tournament=tour)
                loser.is_eliminated = True
                await database_sync_to_async(loser.save)()
            else:
                m = await database_sync_to_async(Match.objects.create)(player1=user_p1, player2=user_p2, score_p1=self.room.score['player1'], score_p2=self.room.score['player2'], state=db_state)
                await database_sync_to_async(WaitRoom.objects.filter(genId=self.game_id).delete)()
            logger.info(f"**** ==== ***** Game saved to database with id {m.id} - players {m.player1} vs {m.player2} / score : {m.score_p1} - {m.score_p2}")
        except Users.DoesNotExist:
            logger.error("**** ==== ***** Error saving game to database: User not found")
        except Tournament.DoesNotExist:
            logger.error(f"**** ==== ***** Error saving game to database: Tournament not found with input: {tour}")
        except Match.DoesNotExist:
            logger.error(f"**** ==== ***** Error saving game to database: Match of Tournament not found with tag {tag} - players {user_p1} - {user_p2} in tournament {tour}")

    async def close_with_error(self, code, message):
        await self.accept() 
        await self.send(text_data=json.dumps({'error': message, 'code': code}))
        await self.close(code=code)
    
    @database_sync_to_async
    def get_player(self):
        try:
            return Users.objects.get(id=self.user.id).alias
        except Users.DoesNotExist:
            logger.error(f'User profile does not exist for user: {self.user.id}')
        return "Unknown"
