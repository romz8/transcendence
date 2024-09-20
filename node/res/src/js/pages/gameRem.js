import {ws, setWebsocket} from "../game/gameWs.js";
import {displayCountdown, updateScores} from "../game/gameDisplay.js";
import {keyState, constants} from "../game/gameDeclarations.js";

const TARGET_FPS = 60; // Target frame rate
const FRAME_DURATION = 1000 / TARGET_FPS;
export let statusDisplay, roleDisplay, Display, mode = 'online';
export let leftPad, rightPad, ball, player, initDirection;
export let start = false, init = false, goal = false, input = false, gameEnded = false,endscore;
export let canvas, ctx;
let id = -1
const bufferTime = 50; // Delay rendering by 100ms
let stateBuffer = [];
let maxBufferSize = 10;
let lastFrameTime = 0;
const FPS = 60;  // Target frames per second
const frameDuration = 1000 / FPS;  // Time per frame in milliseconds
// Select the SVG elements
let svgLeftPad, svgRightPad, svgBall;
let leftPadY, rightPadY, ballX, ballY;


class GameRem extends HTMLElement {
    constructor() {
        super();
        this.gameWidth = 800;
        this.gameHeight = 400;
    }
    
    async connectedCallback() {
        this.innerHTML = /* html */`        
        <style>
        div {
            color: var(--bs-cs-secondary);
        }
        h1 {
            color: var(--bs-cs-secondary);
        }
        h2 {
            color: var(--bs-cs-secondary);
        }
        #mainContainer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        }
        .game-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: ${this.gameWidth}px;
        height: ${this.gameHeight}px;
        background-color: black;
        }
        .scoreboard {
            position: absolute;
            top: 10px;
            width: 100%;
            color: white;
            font-size: 24px;
            text-align: center;
            font-family: Arial, sans-serif;
        }

        .pitch-svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        #countdown {
          font-size: 48px;
          color: white; /* Ensure the text color contrasts with the background */
          text-align: center;
          width: 100%;
        }

        canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
        </style>
        <nav-bar data-authorized></nav-bar>
        <div id="mainContainer">
          <h1>WebSocket Game Pong</h1>
          <div id="status">Connecting...</div>
          <div id="role">Your Role: </div>
          <div id="display">You are: Unidentified</div>
          <button id="logout-button" class="btn btn-danger">Quit Room</button>
          <div id="players-container" class="d-flex justify-content-between mt-3">
              <div id="player1-container" class="player-container">
                  <h2 id="player1-name">Player 1</h2>
                  <div id="player1-score">Score: 0</div>
              </div>
              <div id="player2-container" class="player-container">
                  <h2 id="player2-name">Player 2</h2>
                  <div id="player2-score">Score: 0</div>
              </div>
          </div>
          <div id="countdown" style="font-size: 48px; text-align: center;"></div>
          <!-- Game container with SVG pitch -->
          <div class="game-container">
            <svg class="pitch-svg" xmlns="http://www.w3.org/2000/svg">
              <!-- Pitch background -->
              <rect width="100%" height="100%" fill="black" />
              
              <!-- Top and bottom lines -->
              <line x1="0" y1="0" x2="${this.gameWidth}" y2="0" stroke="white" stroke-width="2"/>
              <line x1="0" y1="${this.gameHeight}" x2="${this.gameWidth}" y2="${this.gameHeight}" stroke="white" stroke-width="2"/>
              
              <!-- Center line dashed -->
              <line x1="${this.gameWidth / 2}" y1="0" x2="${this.gameWidth / 2}" y2="${this.gameHeight}" stroke="white" stroke-width="2" stroke-dasharray="5,10"/>

              <!-- Goal lines dashed -->
              <line x1="0" y1="0" x2="0" y2="${this.gameHeight}" stroke="white" stroke-width="2" stroke-dasharray="5,10"/>
              <line x1="${this.gameWidth}" y1="0" x2="${this.gameWidth}" y2="${this.gameHeight}" stroke="white" stroke-width="2" stroke-dasharray="5,10"/>

              <!-- Paddles and Ball -->
              <!-- Player 1 Paddle -->
              <rect id="player1-paddle" x="0" y="${this.gameHeight / 2 - constants.PADHEIGHT / 2}" width="10" height="75" fill="white"/>
              
              <!-- Player 2 Paddle -->
              <rect id="player2-paddle" x="790" y="${this.gameHeight / 2 - constants.PADHEIGHT / 2}" width="10" height="75" fill="white"/>

              <!-- Ball -->
              <circle id="ball" cx="${this.gameWidth / 2}" cy="${this.gameHeight / 2}" r="5" fill="white"/>
            </svg>
          </div>
        </div>`;
        svgLeftPad = document.getElementById('player1-paddle');
        svgRightPad = document.getElementById('player2-paddle');
        svgBall = document.getElementById('ball');
        statusDisplay = document.getElementById('status');
        roleDisplay = document.getElementById('role');
        Display = document.getElementById('display');
        if (id === -1)
            return; /* BETTER */
        await setWebsocket(id);
        while (!init) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        await gameLoop();
        
    }
}

customElements.define('pong-rem', GameRem);

export default function renderGame (gameid) {
    id = gameid.id;
    return (`<pong-rem></pong-rem>`);
}

async function gameLoop() {
    while (!gameEnded) {
      goal = false;
      //drawPitch(ctx);
      await waitForStart();
      input = true;
      while (!goal) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      input = false;
      reset();
    }
  }

export async function setState(data) {
  // Push the new state and timestamp into the buffer
  stateBuffer.push({
      leftPad: data.leftPad,
      rightPad: data.rightPad,
      ballX: data.ballX,
      ballY: data.ballY,
      timestamp: data.timestamp 
  });
  if (stateBuffer.length > maxBufferSize) {
    stateBuffer.shift(); // Remove the oldest state
  }
}


export function update() {
  const now = Date.now();
  
  if (stateBuffer.length < 2) return false;

  stateBuffer.sort((a, b) => a.timestamp - b.timestamp);

  const targetTime = now - bufferTime;

  let stateA, stateB;
  for (let i = 0; i < stateBuffer.length - 1; i++) {
    if (stateBuffer[i].timestamp <= targetTime && stateBuffer[i + 1].timestamp >= targetTime) {
      stateA = stateBuffer[i];
      stateB = stateBuffer[i + 1];
      break;
    }
  }
  if (stateA && stateB) {
    const progress = (now - bufferTime - stateA.timestamp) / (stateB.timestamp - stateA.timestamp);

    leftPadY = interpolate(stateA.leftPad, stateB.leftPad, progress);
    rightPadY = interpolate(stateA.rightPad, stateB.rightPad, progress);
    ballX = interpolate(stateA.ballX, stateB.ballX, progress);
    ballY = interpolate(stateA.ballY, stateB.ballY, progress);
    return true;
  }
}

export function move() {
  svgLeftPad.setAttribute('y', leftPadY);
  svgRightPad.setAttribute('y', rightPadY);
  svgBall.setAttribute('cx', ballX);
  svgBall.setAttribute('cy', ballY);
}

  export function moveLoop() {
    if (goal) return ;
  
    const now = Date.now();
    const deltaTime = now - lastFrameTime;
  
    if (deltaTime >= frameDuration) {
      let check = update();
      if (check == true) move();
      lastFrameTime = now;
    }
    requestAnimationFrame(moveLoop);
  }
      
  function interpolate(start, end, progress) {
      return start + (end - start) * progress;
    }
  
  function reset() {
      svgLeftPad.setAttribute('x', 0);
      svgLeftPad.setAttribute('y', 400 / 2 - 75 / 2);
      svgRightPad.setAttribute('x', 790);
      svgRightPad.setAttribute('y', 400 / 2 - 75 / 2);
      svgBall.setAttribute('cx', 800 / 2);
      svgBall.setAttribute('cy', 400 / 2);
      keyState.w = false;
      keyState.s = false;
      sendInputs('w');
      sendInputs('s');
    }
  
  
  export async function startCountdown() {
  
    let countdown = 3;
    while (countdown > 0) {
      console.log('countdown')
      displayCountdown(countdown);
      countdown--;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
    }
    const countdownElement = document.getElementById('countdown');
    countdownElement.textContent = 'Start!';
    
      ws.send(JSON.stringify({
        event: 'start',
      }));
      start = true;
  }
  
  export async function initializeElements(data) {
  
      if (data.role == 'player1')
        player = 'player1';
      if (data.role == 'player2')
        player = 'player2';
      initDirection = data.direction;
      window.addEventListener('keydown', (event) => {
        if (input == true && keyState[event.key] == false) {
          keyState[event.key] = true;
          console.log('keydown');
          sendInputs(event.key);
        }
      });
      window.addEventListener('keyup', (event) => {
        if (input == true && keyState[event.key] == true) {
          keyState[event.key] = false;
          console.log('keyup');
          sendInputs(event.key);
        }
      });
      window.addEventListener("keydown", function(e) {
        if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
            e.preventDefault();
        }
      }, false);
      endscore = data.init.endscore;
      init = true;
    }
  
  function sendInputs(key) {      
    ws.send(JSON.stringify({
      event: 'input',
      key: key,
      keyState: keyState[key],
      player: player,
    }));
  }
  
  async function waitForStart() {
      
      ws.send(JSON.stringify({
        event: 'ready',
      }));
      while (!start) {
          await new Promise(resolve => setTimeout(resolve, 10)); // Wait 100ms before checking again
      }
    }
  
  export function setGoal(data) {
    goal = true;
    updateScores(data);
  }
  