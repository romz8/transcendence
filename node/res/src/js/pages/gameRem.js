import {Ball, Pad} from '../game/gameObjects.js'
import {ws, setWebsocket} from "../game/gameWs.js";
import {displayCountdown, updateScores, drawPitch} from "../game/gameDisplay.js";
import {keyState, initPositions, constants} from "../game/gameDeclarations.js";

const TARGET_FPS = 60; // Target frame rate
const FRAME_DURATION = 1000 / TARGET_FPS;
export let statusDisplay, roleDisplay, Display, mode = 'online';
export let leftPad, rightPad, ball, player, initDirection;
export let start = false, init = false, goal = false, input = false, gameEnded = false,endscore;
export let canvas, ctx;
let previousState = null;
let currentState = null;
let currentTimestamp, previousTimestamp, accumulatedTime = 0;
let serverUpdateRate = 1000 / 20;
let id = -1

class GameRem extends HTMLElement {
    constructor() {
        super();
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
            <div class="col-12 text-center">
                <canvas id="canvas"></canvas>
            </div>
        </div>`;
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
      drawPitch(ctx);
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
    if (currentState) {
      previousState = { ...currentState };
      previousTimestamp = currentTimestamp;
    } else {
      previousState = {
          leftPad: leftPad.y,
          rightPad: rightPad.y,
          ballX: ball.x,
          ballY: ball.y
      };
    }
    currentState = {
      leftPad: data.leftPad,
      rightPad: data.rightPad,
      ballX: data.ballX,
      ballY: data.ballY
    };
  
    currentTimestamp = data.timestamp;
    accumulatedTime = 0;
  
  }
  
  export function renderLoop() {
    if (goal) return ;
  
    const now = Date.now();
    const deltaTime = now - currentTimestamp; // Time since the last server update
  
    update(deltaTime);
    render();
  
    previousTimestamp = now;
  
    requestAnimationFrame(renderLoop);
  }
  
  export function render() {
    drawPitch();
    leftPad.draw(ctx);
    rightPad.draw(ctx);
    ball.draw(ctx);
  }
  
  export function update(deltaTime) {
  
    if (previousState && currentState) {
  
      // Calculate interpolation factor 't' based on how far we are between updates
      const t = Math.min(accumulatedTime / serverUpdateRate, 1);
  
      // Interpolated positions using the factor 't'
      leftPad.y = interpolate(previousState.leftPad, currentState.leftPad, t);
      rightPad.y = interpolate(previousState.rightPad, currentState.rightPad, t);
      ball.x = interpolate(previousState.ballX, currentState.ballX, t);
      ball.y = interpolate(previousState.ballY, currentState.ballY, t);
  
      // Reset accumulation once we’ve reached the next frame (1 or beyond)
      if (t >= 1) {
          accumulatedTime = 0; // Reset the accumulator for the next frame
      }
      accumulatedTime += deltaTime;
    }
  }
  
  function interpolate(start, end, progress) {
      return start + (end - start) * progress;
    }
  
  function reset() {
      leftPad.y = initPositions.leftPadY;
      rightPad.y = initPositions.rightPadY;
      ball.x = initPositions.ballX;
      ball.y = initPositions.ballY;
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
      console.log("init data for is" + player + initDirection)
  
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
    
      canvas = document.getElementById("canvas");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx = canvas.getContext("2d");
  
      leftPad = new Pad(data.init.padWidth, data.init.padHeight, data.init.leftPadX, data.init.leftPadY, data.init.padSpeed);
      rightPad = new Pad(data.init.padWidth, data.init.padHeight, data.init.rightPadX, data.init.rightPadY, data.init.padSpeed);
      ball = new Ball(data.init.ballX, data.init.ballY, data.init.ballRadius, data.init.ballSpeedX, data.init.ballSpeedY);
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
  