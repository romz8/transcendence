import random, asyncio, logging, json

logger = logging.getLogger(__name__)

ENDSCORE = 1
MESSAGE_DURATION = 2000
PITCHWIDTH = 800
PITCHHEIGHT = 400
BALL_RADIUS = 5
BALL_SPEED = 3
PAD_SPEED = 5
PAD_HEIGHT = 75
PAD_WIDTH = 10
BOTTOM_BOUNDARY = PITCHHEIGHT - PAD_HEIGHT
TOP_BOUNDARY = 0

init = {
    'padHeight': PAD_HEIGHT,
    'padWidth': PAD_WIDTH,
    'padSpeed': PAD_SPEED,
    'leftPadX': 0,
    'leftPadY': PITCHHEIGHT / 2 - PAD_HEIGHT / 2,
    'rightPadX': 790,
    'rightPadY': PITCHHEIGHT / 2 - PAD_HEIGHT / 2,
    'ballX': PITCHWIDTH / 2,
    'ballY': PITCHHEIGHT / 2,
    'ballRadius': BALL_RADIUS,
    'ballSpeedX': BALL_SPEED,
    'ballSpeedY': BALL_SPEED,   
    'endscore': ENDSCORE,
}

class GameSubject:
    """Building the Subject of Observer design pattern - add/remove observer objs and pub method"""
    def __init__(self):
        self._observers = []
    
    def register_observer(self, obs):
        self._observers.append(obs)

    def unregister_observer(self, obs):
        self._observers.remove(obs)

    async def notify_observer(self, message, event):
        logger.info(f"Notifying observers: {message}, event: {event}")
        for obs in self._observers:
            await obs.broadcast_update(message, event)

class GameManager(GameSubject):
    _instance = None

    def __new__(cls, *args, **kwargs):
        """ Making the game a singleton class to allow only one instance for all consumers in a room"""
        if cls._instance is None:
            return super(GameManager, cls).__new__(cls)
        return cls._instance

    def __init__(self, room):
        super().__init__()
        self.direction = random.randint(1, 4)
        self.goal = False
        self.stop = False
        self.game_state = {'leftPad': 0,'rightPad': 0,
            'ballX': 0,'ballY': 0,
            'ballSpeedX': 0,'ballSpeedY': 0,
            'leftPadUp': False, 'leftPadDown': False,
            'rightPadUp': False,'rightPadDown': False,
            'padSpeed': 0,
        }
        self.register_observer(room)

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
        time_step = 1/60
        while not self.goal and not self.stop:
        
            await self.move_pads()
            await self.move_ball()
            await self.check_collision()
            await self.check_goal()

            await self.notify_observer("update", self.game_state)
            
            await asyncio.sleep(time_step)

        
        self.goal = False
    
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
        if  self.game_state['ballY'] >= PITCHHEIGHT or self.game_state['ballY'] <= 0: 
            self.game_state['ballSpeedY'] *= -1

        #left pad
        if  (self.game_state['ballX'] - init['ballRadius'] <= init['leftPadX'] + init['padWidth'] and
            self.game_state['ballY'] >= self.game_state['leftPad'] and self.game_state['ballY'] <= self.game_state['leftPad'] + init['padHeight']):
                self.game_state['ballSpeedX'] *= -1
                self.game_state['ballX'] = init['leftPadX'] + init['padWidth'] + init['ballRadius']
                #await self.notify_observer("hit", "hit")
                await self.increase_speed()


        #right pad
        if  (self.game_state['ballX'] + init['ballRadius'] >= init['rightPadX'] and
           self.game_state['ballY'] >= self.game_state['rightPad'] and
           self.game_state['ballY'] <= self.game_state['rightPad'] + init['padHeight']):
               self.game_state['ballSpeedX'] *= -1
               self.game_state['ballX'] = init['rightPadX'] - init['ballRadius']
               await self.increase_speed()
                #await self.notify_observer("hit", "hit")

    async def check_goal(self):
        """
         Checks whether a goal has been scored by the ball crossing either boundary.
         - If the ball crosses the left boundary, increments the right player's score and resets the game state.
         - If the ball crosses the right boundary, increments the left player's score and resets the game state.
         - Sets the `self.goal` flag to `True` to indicate a goal and stop the game loop.
         - Broadcasts the goal event, including which player scored and the new direction for the next round, using `broadcast_goal()`.
         - Calls `set_game_state()` to reset the game state after a goal is detected.
         """
        if self.game_state['ballX'] <= 0:
            #game_state['ballSpeedX'] *= -1
            await self.set_game_state()
            self.goal = True
            player = 'player2'

        if  self.game_state['ballX'] >= PITCHWIDTH - BALL_RADIUS:
            #game_state['ballSpeedX'] *= -1
            await self.set_game_state()
            self.goal = True
            player = 'player1'

        if self.goal:
            self.direction = random.randint(1, 4)
            await self.notify_observer("goal", player)
            

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
        await self.notify_observer("update", self.game_state)

    async def increase_speed(self):
       self.game_state['ballSpeedX'] *= 1.2
       self.game_state['ballSpeedY'] *= 1.2