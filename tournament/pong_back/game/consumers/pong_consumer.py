from channels.generic.websocket import AsyncWebsocketConsumer
from .rooms import Room, gamestatus
from game.models import WaitRoom, Users, Match, Tourparticipation, Tournament
from channels.db import database_sync_to_async
import logging, asyncio, random
import json, time
from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import UntypedToken
#from django.contrib.auth.models import User
from .game_management import GameManager, init

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
        self.active = False
        self.tournament_mode = False
    
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
        
        logger.info("** showing the roooms**")
        self.display()

        try:
            await self.game_routing()
            await self.room_allocation()
            await self.init_player()
        
            await self.send(text_data=json.dumps({'type':gamestatus.init.name,'role': self.role,
            'playerName': self.playername,'init': init,}))

            self.room.create_point() #SHOULD IT BE HERE OR IN ROOM ???????????????????
            logger.info("=================================================================")
            logger.info(f"CONNECTION MADE IN {self.game_id} from player {self.room.players[self.user.id]}")
            logger.info(f"GAME_ID : {self.game_id} and CHANNEL NAME : {self.channel_name}")
            logger.info("=================================================================")
            self.display()
        except Exception as e:
            logger.error(f"exception encountered is {str(e)}")
            await self.close_with_error(3088, str(e))
        

    async def game_routing(self):
        try :
            full_path = self.scope['path']
            if '/g/' in full_path:
                game_id = self.scope['url_route']['kwargs']['game_id']
                waitroom = await database_sync_to_async(WaitRoom.objects.get)(genId = game_id)
                self.game_id = game_id
                
                m = await database_sync_to_async(Match.objects.filter(game_id=self.game_id).first)()
                if m is not None and m.state == "finished":
                    raise ValueError("this Game has been played in the past")
           
            elif '/t/' in full_path:
                tour_id = self.scope['url_route']['kwargs']['tour_id']
                match_id = self.scope['url_route']['kwargs']['match_id']
                self.tournament_mode = True
                tour = await database_sync_to_async(Tournament.objects.get)(id=tour_id)
                match = await database_sync_to_async(Match.objects.get)(id = match_id, tournament = tour)
                self.game_id = f"{match_id}-{tour_id}"

                if match.state == "finished":
                    raise ValueError("this tournament Game has been played already")
            else:
                raise ValueError("Incorrect URL Routing to Game")
                
        except WaitRoom.DoesNotExist:
            await self.close_with_error(4001, 'Waitroom for Game not found')
            return
        except Tournament.DoesNotExist:
            await self.close_with_error(4001, 'Tournament for Game not found')
            return

    async def init_player(self):
        if self.user.id in self.room.players.keys():
            if self.room.players[self.user.id]['connected'] == True:
                await self.close_with_error(4002, 'User already in the game')
                return
            elif (self.room.reconnect_player(self.user.id)):
                pass
            else:
                await self.close_with_error(4010, 'User cannot reconnect')
                return
        elif self.room.is_full():
            await self.close_with_error(4003, 'Game is full - limit is 2 players')
            self.display()
            return
        await self.accept()
        self.playername = await self.get_player()
        self.room.add_player(self.channel_name, self.user.id, self.playername)
        await self.channel_layer.group_add(self.game_id, self.channel_name)
        self.active = True
        self.role = self.room.get_player_role(self.user.id)
        
    async def room_allocation(self):
        if self.game_id in PongConsumer.rooms:
            if PongConsumer.rooms[self.game_id].state == gamestatus.over:
                await self.close_with_error(4007, 'Game has been played already')
                return
            elif PongConsumer.rooms[self.game_id].state == gamestatus.quit:
                self.room = PongConsumer.rooms[self.game_id]
                await self.close_with_error(4444, 'Game was quit')
                return
        else: 
            PongConsumer.rooms[self.game_id] = Room(self.game_id, self.channel_layer, self.tournament_mode)
        self.room = PongConsumer.rooms[self.game_id]

    async def disconnect(self, close_code):
        '''
        Handles WebSocket disconnection.
        Depending on the current game state, either ends the game as a forfeit (if 
        the game is in progress) or closes the game room. It also notifies all players 
        of the disconnection and cleans up the room if empty.
        '''
        state = await self.room.disconnect_player(self.user.id)
        if state == gamestatus.quit:
            message = "You left the Game and lost"
        else:
            message = "You left before the game start"
        await self.close_with_error(4444, message)
        logger.info(f" **** in disconnect consumer mthds we have {state.name} and {message}")
        #await self.cleanup_room()

    
    async def cleanup_room(self, timeout=30):
        '''
        if room is empty, deletes the room and removes it from the class-level dictionary.
        if Waitroom id exists, deletes the waitroom
        concept : wheter player 1 is quitting or player 2 is quitting, the room will be deleted
        '''
        if self.game_id not in PongConsumer.rooms:
            return 
        if len(self.room.players) == 2 and len(self.room.disconnect) == 2:
            if self.room.state in [gamestatus.quit, gamestatus.over]:
                await asyncio.sleep(timeout)
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
        
        await self.room.input_handler(data, self.user.id)

    '''' ***************************** EVENT DISPATCH METHODS ************************** '''

    async def dispatch_countdown(self, event):
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
    
    async def dispatch_game_state(self, event):
        """
        Handler for the broadcast of the current game state to all players in the room.
        - Extracts the game_state from the incoming event and sends it to the WebSocket clients.
        - Sends a JSON message containing the positions of the paddles (leftPad, rightPad) and the ball (ballX, ballY).
        - Ensures that all clients update their game views according to the latest game state received from the server.
        """
        logger.info(f"DISPATCH RECEIVE IS {event}")
        game_state = event['game_state']
        room_id = event['room_channel']
        leftPad = game_state['leftPad']
        rightPad = game_state['rightPad']
        ballX = game_state['ballX']
        ballY = game_state['ballY']
        ballSpeedX = game_state['ballSpeedX']
        ballSpeedY = game_state['ballSpeedY']
        padSpeed = game_state['padSpeed']
        roomstate = event['roomstate']
        timestamp = int(time.time() * 1000)

        await self.send(text_data=json.dumps({
            'type': 'update',
            'room_channel': room_id,
            'roomstate': roomstate,
            'leftPad': leftPad,
            'rightPad': rightPad,
            'ballX': ballX,
            'ballY': ballY,
            'ballSpeedX': ballSpeedX,
            'ballSpeedY': ballSpeedY,
            'padSp eed': padSpeed,
            'timestamp': timestamp,
        }))

    async def dispatch_goal(self, event):
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
        score = event['score']
        await self.send(text_data=json.dumps({
            'type': data,
            'roomstate': roomstate,
            'player': player,
            'score' : score,
        }))
    async def dispatch_reset(self, event):
        """
        Broadcasts a reset event to all players after a goal is scored.   
        - Sends a reset message to all connected clients to inform them that the game state is being reset for the next round.
        - This function helps synchronize the clients by ensuring they are all prepared for the next game state after a goal.
        """
        logger.info(f"Now in DISPATCH_RESET sending for {self.role}")
        direction = event['direction']
        roomstate = event['roomstate']
        await self.send(text_data=json.dumps({
            'type': 'reset',
            'state': roomstate,
        }))

    async def dispatch_hit(self, event):
        """
        Broadcasts a reset event to all players after a goal is scored.   
        - Sends a reset message to all connected clients to inform them that the game state is being reset for the next round.
        - This function helps synchronize the clients by ensuring they are all prepared for the next game state after a goal.
        """
        await self.send(text_data=json.dumps({
            'type': 'hit',
        }))
        
    async def game_over(self, event):
        '''
        Handles the "game over" event and notifies the client.
        This method sends the game result (winner, loser, final scores) to the client, 
        depending on the game state and then cleans up by discarding the channel layer 
        group and closing the WebSocket connection.
        '''
        logger.info("*** IN GAME OVER MESSAGE *****")
        try:
            score = event['score']
            roomstate = event['roomstate']
            winner = event.get('winner', None)
            loser = event.get('loser', None)
            match roomstate:
                case 'over':
                    message = f'Game over: {winner} won with {score[winner]} - {loser} lost with {score[loser]}'
                case 'quit':
                    message = f'{loser} quit the game'
                case _:
                    message = 'Unknown state'                
            await self.send(text_data=json.dumps({
                'score': score,'roomstate': roomstate,
                'winner': winner,'loser': loser,'message': message}))
        except Exception as e:
            logger.error(f"Error sending game_over message: {e}")

        finally:
            await self.channel_layer.group_discard(self.game_id, self.channel_name)
            await self.close(code=4006)
    
    '''*********************************** UTILS METHODS ********************************************'''

    @database_sync_to_async
    def get_player(self):
        try:
            return Users.objects.get(id=self.user.id).alias
        except Users.DoesNotExist:
            logger.error(f'User profile does not exist for user: {self.user.id}')
        return "Unknown"
    
    async def close_with_error(self, code, message):
        logger.error(f"***** CLOSING ON ERROR {code} - {message} ********")
        await self.accept()
        if code == 4444:
            await self.send(text_data=json.dumps({
                'score': self.room.score,'roomstate': self.room.state.name,
                'winner': self.room.winner,'loser': self.room.loser,'message': message}))
        else:
            await self.send(text_data=json.dumps({'error': message, 'code': code}))
        await self.close(code=code)
    
    def display(self):
        for room_id, room in PongConsumer.rooms.items():
            logger.info('*************** Room Display **********************')
            logger.info(f'Room: {room_id}')
            logger.info(f'game_id is : {room.game_id}')
            logger.info(f'state is : {room.state}')
            logger.info(f'Players: {room.players}')
            logger.info(f'score is : {room.score}')
            