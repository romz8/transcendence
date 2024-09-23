import random
import asyncio
import logging
import json
from .rooms import gamestatus

logger = logging.getLogger(__name__)

PADDING = 50
ENDSCORE = 3
MESSAGE_DURATION = 2000
PITCHWIDTH = 600
PITCHHEIGHT = 400
TOP_BOUNDARY = PADDING
BALL_SPEED = 8
PAD_SPEED = 12

init = {
    'padHeight': 80,
    'padWidth': 10,
    'padSpeed': PAD_SPEED,
    'leftPadX': PADDING + 10,
    'leftPadY': PITCHHEIGHT / 2 + PADDING,
    'rightPadX': PITCHWIDTH + PADDING - 10 - 10,
    'rightPadY': PITCHHEIGHT / 2 + PADDING,
    'ballX': PITCHWIDTH / 2 + PADDING,
    'ballY': PITCHHEIGHT / 2 + PADDING,
    'ballRadius': 5,
    'ballSpeedX': BALL_SPEED,
    'ballSpeedY': BALL_SPEED,   
    'endscore': ENDSCORE,
}

BOTTOM_BOUNDARY = PITCHHEIGHT + PADDING - init['padHeight']



class GameManager:
    def __init__(self, room, room_group_name, channel_layer):
        self.room = room
        self.room_group_name = room_group_name
        self.channel_layer = channel_layer #horrible ... will rewrite
        self.direction = 0
        self.game_state = {
            'leftPad': 0,
            'rightPad': 0,
            'ballX': 0,
            'ballY': 0,
            'ballSpeedX': 0,
            'ballSpeedY': 0,
            'leftPadUp': False,
            'leftPadDown': False,
            'rightPadUp': False,
            'rightPadDown': False,
            'padSpeed': 0,
        }

    async def set_game_state(self):
        """
        Initializes or resets the game state for a new round or game start.
        - Resets the positions of the paddles and the ball to their initial values as defined in the `init` dictionary.
        - Sets the ball's speed in both X and Y directions to the initial speed.
        - Randomly determines the initial direction of the ball by potentially inverting its X or Y velocity.
        """
        init['ballSpeedX'] = BALL_SPEED
        init['ballSpeedY'] = BALL_SPEED

        logger.info('Setting game state')
        self.game_state['leftPad'] = init['leftPadY']
        self.game_state['rightPad'] = init['rightPadY']
        self.game_state['ballX'] = init['ballX']
        self.game_state['ballY'] = init['ballY']
        self.game_state['ballSpeedX'] = init['ballSpeedX']
        self.game_state['ballSpeedY'] = init['ballSpeedY']
        self.game_state['padSpeed'] = init['padSpeed']

        if self.direction == 1:
           self.game_state['ballSpeedX'] *= -1
        elif self.direction == 2:
            pass  # No change
        elif self.direction == 3:
           self.game_state['ballSpeedY'] *= -1
        elif self.direction == 4:
           self.game_state['ballSpeedX'] *= -1
           self.game_state['ballSpeedY'] *= -1

    async def update_game_state(self):
        """
        Main game loop responsible for continuously updating the game state until a goal is scored.
        - Repeatedly calls `move_pads()` to update the paddles' positions based on player inputs.
        - Continuously updates the ball's position via `move_ball()`.
        - Checks for collisions between the ball and paddles or walls using `check_collision()`.
        - Calls `check_goal()` to determine if a goal has been scored, which triggers the end of the loop.
        - The loop runs at approximately 60 frames per second (`await asyncio.sleep(1 / 60)`), ensuring smooth gameplay.
        - Resets the room's goal state to `False` after a goal is detected.
        """
        time_step = 1/20
        while not self.room.goal:
        
            await self.move_pads()
            await self.move_ball()
            await self.check_collision()
            await self.check_goal()

            await self.send_updates()
            
            await asyncio.sleep(time_step)

        
        self.room.goal = False

    '''
    ****************************************************************************
    BROADCAST GAME EVENTS
    ****************************************************************************
    '''
    # async def broadcast_countdown(self, event):
    #     """
    #     Broadcasts a Countdown event to all players in the room. they then alert the front socket
    #     - Extracts the event type from the incoming event data and sends it as a JSON message to all clients.
    #     - This function is used for broadcasting general game-related events that do not require specific game state updates
    #     such as notifications or simple status changes.
    #     """        
    #     data = event['event']
    #     roomstate = event['roomstate']
    #     players = event['players']
    #     self.direction = event['direction']
    #     await self.send(text_data=json.dumps({
    #         'type': data,
    #         'roomstate' : roomstate,
    #         'players': players,
    #         'direction': self.direction,
    #     }))
    
    async def send_updates(self):
        """
        Broadcasts the current game state to all connected clients in the room.
        - Sends a `broadcast_game_state` event with the latest `game_state` dictionary, which includes the positions of the ball and paddles.
        - Ensures that all players receive real-time updates on the game state, keeping their displays synchronized.
        - This function is called during the game loop to maintain consistency across clients.
        """

        logger.info('entramos en send updates')

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'broadcast_game_state',
                'roomstate' : self.room.state.name,
                'game_state':self.game_state,
                'room_channel':self.room_group_name,
            }   
            )

    # async def broadcast_game_state(self, event):
    #     """
    #     Handler for the broadcast of the current game state to all players in the room.
    #     - Extracts the `game_state` from the incoming event and sends it to the WebSocket clients.
    #     - Sends a JSON message containing the positions of the paddles (`leftPad`, `rightPad`) and the ball (`ballX`, `ballY`).
    #     - Ensures that all clients update their game views according to the latest game state received from the server.
    #     """

    #     game_state = event['game_state']
    #     room_id = event['room_channel']
    #     leftPad = game_state['leftPad']
    #     rightPad = game_state['rightPad']
    #     ballX = game_state['ballX']
    #     ballY = game_state['ballY']
    #     roomstate = event['roomstate']
    #     await self.send(text_data=json.dumps({
    #         'type': 'update',
    #         'room_channel': room_id,
    #         'roomstate': roomstate,
    #         'leftPad': leftPad,
    #         'rightPad': rightPad,
    #         'ballX': ballX,
    #         'ballY': ballY,
    #     }))


    # async def broadcast_goal(self, event):
    #     """
    #     Broadcasts a goal event to all players, indicating which player scored and the new direction of the ball.

    #     - Extracts the player who scored and the new ball direction from the incoming event.
    #     - Sends a JSON message containing the player who scored and the direction for the next round.
    #     - Ensures that all players are aware of the goal and prepares them for the next round of play.
    #     """
    #     logger.info(f"Send message: {event['event']} to {self.role}")
    #     roomstate = event['roomstate']
    #     data = event['event']
    #     player = event['player']
    #     direction = event['direction']
    #     score = event['score']
    #     await self.send(text_data=json.dumps({
    #         'type': data,
    #         'roomstate': roomstate,
    #         'player': player,
    #         'direction': direction,
    #         'score' : score,
    #     }))

    # async def broadcast_reset(self, event):
    #     """
    #     Broadcasts a reset event to all players after a goal is scored.   
    #     - Sends a reset message to all connected clients to inform them that the game state is being reset for the next round.
    #     - This function helps synchronize the clients by ensuring they are all prepared for the next game state after a goal.
    #     """
    #     direction = event['direction']
    #     roomstate = event['roomstate']
    #     await self.send(text_data=json.dumps({
    #         'type': 'reset',
    #         'state': roomstate,
    #     }))

    # async def broadcast_hit(self, event):
    #     """
    #     Broadcasts a reset event to all players after a goal is scored.   
    #     - Sends a reset message to all connected clients to inform them that the game state is being reset for the next round.
    #     - This function helps synchronize the clients by ensuring they are all prepared for the next game state after a goal.
    #     """
    #     await self.send(text_data=json.dumps({
    #         'type': 'hit',
    #     }))
    
    '''
    ****************************************************************************
    GAME MECHANICS AND MOVEMENT RENDERING
    ****************************************************************************
    '''

    async def move_pads(self): 

        if self.game_state['leftPadUp'] == True: 
            if self.game_state['leftPad'] - self.game_state['padSpeed'] < TOP_BOUNDARY:
               self.game_state['leftPad'] = TOP_BOUNDARY 
            else:
                self.game_state['leftPad'] -= self.game_state['padSpeed'] 
        
        if self.game_state['leftPadDown'] == True:
            if self.game_state['leftPad'] + self.game_state['padSpeed']  > BOTTOM_BOUNDARY:
               self.game_state['leftPad'] = BOTTOM_BOUNDARY
            else:
               self.game_state['leftPad'] +=self.game_state['padSpeed']

        if self.game_state['rightPadUp'] == True:
            if self.game_state['rightPad'] - self.game_state['padSpeed'] < TOP_BOUNDARY:
               self.game_state['rightPad'] = TOP_BOUNDARY 
            else:
               self.game_state['rightPad'] -= self.game_state['padSpeed']
        if self.game_state['rightPadDown'] == True:
            if self.game_state['rightPad'] + self.game_state['padSpeed'] > BOTTOM_BOUNDARY:
                self.game_state['rightPad'] = BOTTOM_BOUNDARY
            else:
               self.game_state['rightPad'] +=self.game_state['padSpeed']

    async def move_ball(self):
       self.game_state['ballX'] += self.game_state['ballSpeedX']
       self.game_state['ballY'] += self.game_state['ballSpeedY']

    async def check_collision(self):
        
        #wall
        if self.game_state['ballY'] + init['ballRadius'] >= PITCHHEIGHT + PADDING or self.game_state['ballY'] - init['ballRadius'] <= PADDING: 
           self.game_state['ballSpeedY'] *= -1

        #left pad
        if  (self.game_state['ballX'] - init['ballRadius'] <= init['leftPadX'] + init['padWidth'] and \
           self.game_state['ballY'] >= self.game_state['leftPad'] and self.game_state['ballY'] <= self.game_state['leftPad'] + init['padHeight']):
               self.game_state['ballSpeedX'] *= -1
               self.game_state['ballX'] = init['leftPadX'] + init['padWidth'] + init['ballRadius']
               await self.channel_layer.group_send(self.room_group_name, {'type': 'broadcast_hit','event': 'hit',})
               await self.increase_speed()


        #right pad
        if  (self.game_state['ballX'] + init['ballRadius'] >= init['rightPadX'] and
           self.game_state['ballY'] >= self.game_state['rightPad'] and
           self.game_state['ballY'] <= self.game_state['rightPad'] + init['padHeight']):
               self.game_state['ballSpeedX'] *= -1
               self.game_state['ballX'] = init['rightPadX'] - init['ballRadius']
               await self.channel_layer.group_send( self.room_group_name,{'type': 'broadcast_hit','event': 'hit',})
               await self.increase_speed()
    
    async def check_goal(self):
        """
         Checks whether a goal has been scored by the ball crossing either boundary.
         - If the ball crosses the left boundary, increments the right player's score and resets the game state.
         - If the ball crosses the right boundary, increments the left player's score and resets the game state.
         - Sets the `self.room.goal` flag to `True` to indicate a goal and stop the game loop.
         - Broadcasts the goal event, including which player scored and the new direction for the next round, using `broadcast_goal()`.
         - Calls `set_game_state()` to reset the game state after a goal is detected.
         """
        if self.game_state['ballX'] - init['ballRadius'] < PADDING:
            #game_state['ballSpeedX'] *= -1
            await self.set_game_state()
            self.room.goal = True
            self.room.score["player2"] +=1
            player = 'player2'

        if self.game_state['ballX'] + init['ballRadius'] > PITCHWIDTH + PADDING:
            #game_state['ballSpeedX'] *= -1
            await self.set_game_state()
            self.room.goal = True
            self.room.score["player1"] +=1
            player = 'player1'

        if self.room.goal:
            self.room.direction = random.randint(1, 4)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast_goal',
                    'roomstate' : self.room.state.name,
                    'event': 'goal',
                    'player': player,
                    'direction': self.room.direction,
                    'score':self.room.score,})

            for x in self.room.score.values():
                if x >= ENDSCORE:
                    self.room.state = gamestatus.over
                    #await self.end_with_winner()

    async def set_key_state(self, data):
        player = data['player']
        key_state = data['keyState']
        key = data['key']


        if ( player == 'player1'):
            if (key == 'w') or (key == 'ArrowUp'):
               self.game_state['leftPadUp'] = key_state
            elif (key == 's') or (key == 'ArrowDown'):
               self.game_state['leftPadDown'] = key_state    
        
        elif ( player == 'player2'):
            if (key == 'w') or (key == 'ArrowUp'):
               self.game_state['rightPadUp'] = key_state
            elif (key == 's') or (key == 'ArrowDown'):
               self.game_state['rightPadDown'] = key_state
        
        await self.move_pads()
        await self.send_updates()

    async def increase_speed(self):
       self.game_state['ballSpeedX'] *= 1.2
       self.game_state['ballSpeedY'] *= 1.2