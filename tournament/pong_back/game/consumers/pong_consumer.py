from channels.generic.websocket import AsyncWebsocketConsumer
from .rooms import Room, gamestatus
from game.models import WaitRoom, Users, Match, Tourparticipation, Tournament
from channels.db import database_sync_to_async
import logging, asyncio, random
import json, time
from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import UntypedToken
from .game_management import GameManager, init

logger = logging.getLogger(__name__)


class PongConsumer(AsyncWebsocketConsumer):
    '''
    async webSocket consumer that manages the lifecycle of the pong game
    Attributes:
        rooms (dict): A class-level dictionary to track and centralize active game rooms.
    '''
    rooms = {}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.game_id = None
        self.room = None
        self.role = None
        self.playername = None
        self.tournament_mode = False
    
    async def connect(self):
        '''
        Handles a new WebSocket connection.
        Steps:
        1. Validates user authentication, 
        2. handle and check routing based on url
        3. init player (handle its room allocation and connection to rool and channel_layer)
        4. return succesful init message to ws or return error 
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
            self.room.create_game()
            logger.info(f"== *** === CONNECTION MADE IN {self.game_id} from player {self.room.players[self.user.id]}")
            self.display()
        except Exception as e:
            logger.error(f"exception encountered is {str(e)}")
            await self.close_with_error(3088, str(e))
        

    async def game_routing(self):
        """
        1.check for game or tournament path attributes
        2. extract respectiv attribute and check if path validate (waitroom, tournament, not played before)
        """
        try :
            full_path = self.scope['path']
            if '/g/' in full_path:
                game_id = self.scope['url_route']['kwargs'].get('game_id')
                waitroom = await database_sync_to_async(WaitRoom.objects.get)(genId = game_id)
                self.game_id = game_id
                
                m = await database_sync_to_async(Match.objects.filter(game_id=self.game_id).first)()
                if m is not None and m.state == "finished":
                    if self.game_id not in PongConsumer.rooms:
                        raise ValueError("this Game has been played in the past")
           
            elif '/t/' in full_path:
                tour_id = self.scope['url_route']['kwargs'].get('tour_id', None)
                match_id = self.scope['url_route']['kwargs'].get('match_id', None)
                if tour_id is None or match_id is None:
                    raise ValueError("incorrect Tournament Url Structure")
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
        '''
        handle player state in the game :
        1. check if the player has been allocated to room -> if so and connected state :
            close ws duplicate,otherwise try to reconnect, if failure return issue and close ws
        2. otherwise verify the room is not full, if not accept ws connetino add player to room and channel_layer
        '''
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
        await self.room.add_player(self.channel_name, self.user.id, self.playername)
        await self.channel_layer.group_add(self.game_id, self.channel_name)
        self.role = self.room.get_player_role(self.user.id)
        
    async def room_allocation(self):
        """
        Allocates a player to a game room based on game ID.
        1. If the game ID exists in the active rooms:
            - Check if the game has ended (either 'over' or 'quit') and close the WebSocket if necessary.
        2. If the game ID does not exist:
            - Create a new room and allocate the player to that room.
        3. Assign the room instance to the 'room' attribute.
        """

        if self.game_id in PongConsumer.rooms:
            self.room = PongConsumer.rooms[self.game_id] #TRY IT HERE FOR THE NONETYPE ISSUE
            if self.room.state == gamestatus.over:
                await self.close_with_error(4007, f'{self.user.alias} : Game has been played already')
                return
            elif self.room.state == gamestatus.quit:
                await self.close_with_error(4444, f'{self.user.alias} : You left the Game!')
                return
        else: 
            PongConsumer.rooms[self.game_id] = Room(self.game_id, self.channel_layer, self.tournament_mode, time.time())
        asyncio.create_task(PongConsumer.cleanup_room(60))
        self.room = PongConsumer.rooms[self.game_id]

    async def disconnect(self, close_code):
        '''
        Handles WebSocket disconnection.
        Depending on the current game state, either ends the game as a forfeit (if 
        the game is in progress) or closes the game room. It also notifies all players 
        of the disconnection and cleans up the room if empty.
        '''
        logger.info(f"IN DISCONNECT for {self.user}")
        if self.room is None:
            logger.error(f"Room is None, unable to disconnect player {self.user}")
            await self.close_with_error(4005, "Room not found during disconnect")
            return
        state = await self.room.disconnect_player(self.user.id)
        if state == gamestatus.quit:
            message = "You left the Game and lost"
        else:
            message = "You left before the game start"
        await self.close_with_error(4444, message)
        logger.info(f" **** in disconnect mthd consumer for {self.user} : we have {state.name} and {message}")
        logger.info(f"AFTER DISCONNET for {self.user} - we have players : {self.room.players}")
        #await self.cleanup_room()


    async def receive(self, text_data):
        """
        handle incoming message from ws -> check if quit, otherwise pass to room centralized handler
        """
        data = json.loads(text_data)

        if 'logout' in data and data['logout'] == True:
            logger.info('Logout received')
            await self.disconnect(4005)
            return
        
        await self.room.input_handler(data, self.user.id)

    '''' ***************************** EVENT DISPATCH METHODS ************************** '''

    async def dispatch_countdown(self, event):
        """
        dispath to the front socket the poinrt countdown
        - Extracts the event type from the incoming event data and sends it as a JSON message to all clients.
        - general game-related events that do not require specific game state updates
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
        dipatch locally to WS the current game state.
        Sends a JSON message with the positions of paddles and ball, ball speeds, and the room state.
        Ensures that all connected clients synchronize their game view with the latest state from the server.
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
        Sends a goal event to the current WebSocket connection.
        - Sends a JSON message with the player who scored, the updated score, and the direction for the next round.
        - Notifies the client that a goal has been scored to prepare for the next round of play.
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
        Sends a reset event to the current WebSocket connection.
        - Sends a message to inform the client that the game state is being reset for the next round.
        - Ensures the client is synchronized with the upcoming game state after a goal is scored.
        """
        logger.info(f"Now in DISPATCH_RESET sending for {self.role}")
        direction = event['direction']
        roomstate = event['roomstate']
        await self.send(text_data=json.dumps({
            'type': 'reset',
            'state': roomstate,
        }))
        
    async def game_over(self, event):
        """
        Sends a 'game over' event to the current WebSocket connection.
        - Sends the final game result, including the winner, loser, and final scores, to the client.
        - Cleans up by removing the client from the channel layer group and closing the WebSocket connection.
        """
        logger.info("*** IN GAME OVER MESSAGE *****")
        try:
            score = event['score']
            roomstate = event['roomstate']
            winner = event.get('winner', None)
            loser = event.get('loser', None)
            winner_name = None
            loser_name = None

            for player_id, player_data in self.room.players.items():
                if player_data['role'] == self.room.winner:
                    winner_name = player_data['playername']
                elif player_data['role'] == self.room.loser:
                    loser_name = player_data['playername']
            match roomstate:
                case 'over':
                    message = f'Game over: {winner} won with {score[winner]} - {loser} lost with {score[loser]}'
                case 'quit':
                    message = f'{loser} quit the game'
                case _:
                    message = 'Unknown state'                
            await self.send(text_data=json.dumps({
                'score': score,'roomstate': roomstate,
                'winner': winner_name,'loser': loser_name,'message': message}))
        except Exception as e:
            logger.error(f"Error sending game_over message: {e}")

        finally:
            await self.channel_layer.group_discard(self.game_id, self.channel_name)
            await self.close(code=4006)
    
    '''*********************************** UTILS METHODS ********************************************'''

    @classmethod
    async def cleanup_room(cls, delay):
        '''
        A garbage-collector-style seeking inactive rooms for more than 60sec. cls function Implemented
        via Celery task Manager 
        '''
        await asyncio.sleep(delay)
        logger.info("*** Arriving in cleanup Room ***")
        to_delete = set()
        current_time = time.time()
        deleted = 0

        for game_id, room in cls.rooms.items():
            if game_id is None:
                del room 
                logger.info(f"**** CLEARED empty Room")
            if len(room.players) == len(room.disconnect): 
                elapsed_time = current_time - room.init_time
                if elapsed_time > 60:
                    to_delete.add(game_id)
        
        for id in to_delete:
            del cls.rooms[id]
            deleted += 1
            logger.info(f"**** CLEARED Room {id}")
        
        return (deleted)

    @database_sync_to_async
    def get_player(self):
        """
         Retrieves the player's alias from the database.
         - Fetches the alias associated with the current user ID.
         - If the user profile does not exist, returns 'Unknown'.
         """
        try:
            return Users.objects.get(id=self.user.id).alias
        except Users.DoesNotExist:
            logger.error(f'User profile does not exist for user: {self.user.id}')
        return "Unknown"
    
    async def close_with_error(self, code, message):
        """
        close function system: accept the connection to return a tailor-made message and code
        """
        await self.accept()

        if code == 4444:
            winner_name = None
            loser_name = None

            for player_id, player_data in self.room.players.items():
                if player_data['role'] == self.room.winner:
                    winner_name = player_data['playername']
                elif player_data['role'] == self.room.loser:
                    loser_name = player_data['playername']

            await self.send(text_data=json.dumps({
                'score': self.room.score,
                'roomstate': self.room.state.name,
                'winner': winner_name,
                'loser': loser_name,
                'message': message
            }))
        else:
            await self.send(text_data=json.dumps({'error': message, 'code': code}))

        await self.close(code=code)

    def display(self):
        for room_id, room in PongConsumer.rooms.items():
            logger.info('*************** Room Display **********************')
            logger.info(f'Room: {room_id}')
            logger.info(f'Created at : {room.init_time}')
            logger.info(f'game_id is : {room.game_id}')
            logger.info(f'state is : {room.state}')
            logger.info(f'Players: {room.players}')
            logger.info(f'score is : {room.score}')
            logger.info(f'total disconnected is : {len(room.disconnect)}')

            