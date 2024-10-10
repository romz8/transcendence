import { displayCountdown } from "../game/gameDisplay";
import { router } from "../routes";
import { getCookie } from "../user_login";
import { Modal } from 'bootstrap';
import i18next from 'i18next';

let gameid = -1;
const WIN = 1;
class PongAI extends HTMLElement {
    constructor() {
        super();
        this.gameWidth = 800;
        this.gameHeight = 400;
        this.paddleHeight = 75;
        this.paddleWidth = 10;
        this.ballSize = 10;
        this.paddleSpeed = 5;
        this.ballSpeedX = 3;
        this.ballSpeedY = 2;
        this.aiSpeed = 5;

        this.leftPaddleY = this.gameHeight / 2 - this.paddleHeight / 2;
        this.futureLeftY = this.gameHeight / 2 - this.paddleHeight / 2;
        this.leftPaddleX = 10;
        this.rightPaddleY = this.gameHeight / 2 - this.paddleHeight / 2;
        this.rightPaddleX = 785;
        this.ballX = this.gameWidth / 2;
        this.ballY = this.gameHeight / 2;
        this.ballDirectionX = Math.floor(Math.random() * 2) == 0? -1: 1;
        this.ballDirectionY = Math.floor(Math.random() * 2) == 0? -1: 1;

        this.leftScore = 0;
        this.rightScore = 0;

        this.keys = {};
    }

    async connectedCallback() {

        this.innerHTML = /*html*/`
        <style>
        h1 {  
            color: var(--bs-cs-secondary);
            font-size: 50px;
        }
        h2 {
            color: var(--bs-cs-secondary);
            font-size: 35px;
        }
        h3 {
            color: var(--bs-cs-secondary);
            font-size: 15px;
        }
        h4 {
            color: var(--bs-cs-secondary);
            font-size: 10px;
        }
        #mainContainer {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }

        #players-container {
            display: flex;
            position: relative;
            top: -100px;
            justify-content: space-between; /* Distributes child elements to the extremes */
            width: 100%; /* Ensures the container uses full width */
            z-index: 2;
        }

        .game-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${this.gameWidth}px;
            height: ${this.gameHeight}px;
            background-color: black;
            z-index: 1;
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

        #logout-button {
            position: absolute;
            top: 670px;
        }

        canvas {
            width: 100%;
            height: 100%;
            display: block;
        }

        @keyframes rainbow-cascade {
            0% { color: red; }
            14% { color: orange; }
            28% { color: yellow; }
            42% { color: green; }
            57% { color: blue; }
            71% { color: indigo; }
            85% { color: violet; }
            100% { color: red; }
        }

        .highlight {
            animation: rainbow-cascade 1.5s linear infinite;
            font-weight: bold;
        }

        </style>
        <nav-bar data-authorized></nav-bar>
        <div id="mainContainer">
        <h1>Pong</h1>
        <div id="countdown" style="font-size: 48px; text-align: center;"></div>
        <div class="game-container">
            <div id="players-container">
                <div id="player1-container" class="player-container">
                    <h2 id="player1-name">AI</h2>
                    <h3 id="player1-score" >Score: 0</h3>
                </div>
                <div id="player2-container" class="player-container">
                    <h2 id="player2-name">${localStorage.getItem('alias')}</h2>
                    <h3 id="player2-score">Score: 0</h3>
                </div>
            </div>
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
                <rect id="player1-paddle" x="0" y="${this.gameHeight / 2 - this.paddleHeight / 2}" width="${this.paddleWidth}" height="${this.paddleHeight}" fill="white"/>
                
                <!-- Player 2 Paddle -->
                <rect id="player2-paddle" x="790" y="${this.gameHeight / 2 - this.paddleHeight / 2}" width="${this.paddleWidth}" height="${this.paddleHeight}" fill="white"/>

                <!-- Ball -->
                <circle id="ball" cx="${this.gameWidth / 2}" cy="${this.gameHeight / 2}" r="5" fill="white"/>
            </svg>
        </div>
    </div>
        `;

        this.leftPaddle = document.getElementById('player1-paddle');
        this.rightPaddle = document.getElementById('player2-paddle');
        this.ball = document.getElementById('ball');
        this.palyer1score = document.getElementById('player1-score');
        this.palyer2score = document.getElementById('player2-score');

        this.updatePositions();
        await this.startGame();
    }
    disconnectedCallback()
    {
        this.stopGame()
    }

    stopGame() {
        this.gameRunning = false;
        clearInterval(this.iaInterval);
        cancelAnimationFrame(this.animationFrameId);
    }

    updatePositions() {
        this.leftPaddle.setAttribute('y', this.leftPaddleY);
        this.rightPaddle.setAttribute('y', this.rightPaddleY);
        this.ball.setAttribute('cx', this.ballX);
        this.ball.setAttribute('cy', this.ballY);
    }
    
    iaPredict(obj) {
        const ballSpeedX = (obj.ballSpeedX * obj.ballDirectionX)
        const ballSpeedY = (obj.ballSpeedY * obj.ballDirectionY)
        let futureLeft = obj.ballY + ((obj.leftPaddleX - obj.ballX) / ballSpeedX) * ballSpeedY;
        
        while (futureLeft < 0 || futureLeft > obj.gameHeight)
        {
            if (futureLeft < 0)
                futureLeft = -futureLeft;
            else if (futureLeft > obj.gameHeight)
                futureLeft = 2 * obj.gameHeight - futureLeft;
        }

        obj.futureLeftY = futureLeft - obj.paddleHeight / 2;
    }

    async doCountdown() {
        let countdown = 3;
        while(countdown > 0)
        {
            displayCountdown(countdown);
            countdown--;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        displayCountdown();
    }

    async startGame() {
        this.ballX = this.gameWidth / 2;
        this.ballY = this.gameHeight / 2;
        this.ballDirectionX = Math.floor(Math.random() * 2) == 0? -1: 1;
        this.ballDirectionY = Math.floor(Math.random() * 2) == 0? -1: 1;
        this.ballSpeedX = 3;
        this.ballSpeedY = 2;

        this.leftScore = 0;
        this.rightScore = 0;
        this.gameRunning = true;

        document.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);        
        
        await this.doCountdown();

        const  gameLoop = async () => {
            if (!this.gameRunning) return ;
            this.movePaddles();
            await this.moveBall();
            this.updatePositions();
            if (this.checkWinner() == false)
                requestAnimationFrame(gameLoop);
        };
        this.iaInterval = setInterval(this.iaPredict, 1000, this);
        await gameLoop();
    }

    displayOverMessage() {
    
        let messageStyle, homeButton = '', tournamentButton = '';
        if (gameid){
            tournamentButton =/*html*/ `<button id="tournament-btn" class="btn btn-primary mt-3">Ir al Torneo</button>`
        }
        else{
            homeButton = /*html*/`<button id="home-btn" class="btn btn-warning mt-3">Go Home</button>`;
        }
        if (this.leftScore < this.rightScore) {
            messageStyle = "text-success";
        } else {
            messageStyle = "text-danger";
            homeButton = /*html*/`<button id="home-btn" class="btn btn-warning mt-3">Go Home</button>`;
        }
    
        const mainContainer = document.getElementById('mainContainer');
    
        mainContainer.innerHTML = /* html */`
            <div class="text-center mt-5">
                <h2 class="${messageStyle}">${this.leftScore < this.rightScore ? 'You won!' : 'You lost!'}</h2>
                <p>
                    AI ${this.leftScore} - 
                    YOU ${this.rightScore}
                </p>
                ${tournamentButton}
                ${homeButton}
            </div>
        `;

        if (gameid){
    
            document.getElementById('tournament-btn').addEventListener('click', () => {
                window.location.href = `/tournament/${gameid[1]}`;
            });
        }
        if (document.getElementById('home-btn')) {
            document.getElementById('home-btn').addEventListener('click', () => {
                history.pushState('', '', '/');
                router();
            });
        }
    }
    


    async fetchResult(){
        const access = await getCookie('token');
        const infoBody = JSON.stringify({"score_ai": this.leftScore,"score_user": this.rightScore})
        fetch(`https://localhost:3001/tourapi/game/tournament/${gameid[0]}/match_ai/`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + access,
                'Content-Type': 'application/json'
            },
            body: infoBody
        })
        .then(response => {
            if (!response.ok)
                throw new Error('Network response was not ok ' + response.statusText);
            return response.json();
        })
        .then(data => {
            this.displayOverMessage();
        })
        .catch(error => 
        {
            this.displayOverMessage();
        });
    }

    genModalHTML(text, btnHome = '', btnOptional = ''){
        const tmpDiv = document.createElement('div');
        tmpDiv.innerHTML = `
        <div class="modal fade modal-sm" id="TournModal" tabindex="-1" aria-labelledby="TournModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="TournModalLabel">GAME OVER</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body d-flex flex-column justify-content-center align-items-center">
                <h6>${i18next.t(text)}</h6>
              </div>
              <div class="modal-footer">
                ${btnHome}
                ${btnOptional}
              </div>
            </div>
          </div>
        </div>
        `;
        return (tmpDiv);
    }

    genFinishModal(text){
        const btnHome = `<button id="home-btn" type="button" data-bs-dismiss="modal" class="btn btn-primary">${i18next.t('go_home')}</button>`;
        const btnOptional = `<button id="again-btn" type="button" data-bs-dismiss="modal" class="btn btn-primary">${i18next.t('try_again')}</button>`;
        const modalShit = this.genModalHTML(text, btnHome, btnOptional);
        this.appendChild(modalShit);
        const TournModal = new Modal(document.getElementById('TournModal'));
        TournModal.show();
        const againBtn = document.getElementById("again-btn");
        if (againBtn) {
            againBtn.addEventListener('click', () => {
                history.pushState('', '', '/gamebot');
                router();
            });
        }
        const homeBtn = document.getElementById("home-btn");
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                history.pushState('', '', '/');
                router();
            });
        }
    }

    checkWinner(){
        this.palyer1score.textContent = `Score: ${this.leftScore}`
        this.palyer2score.textContent = `Score: ${this.rightScore}`
        if (this.leftScore == WIN )
        {
            if (gameid != -1)
            {
                this.fetchResult();
            }
            else
                this.genFinishModal("ai_won");
            return true;
        }
        else if (this.rightScore == WIN )
        {
            if (gameid != -1)
            {
                this.fetchResult();
            }
            else
                this.genFinishModal("you_won");
            return true;
        }
        return false;
    }


    movePaddles() {
        if (Math.abs(this.leftPaddleY - this.futureLeftY) > 5) {
            if (this.leftPaddleY > this.futureLeftY && this.leftPaddleY > 0) {
                this.leftPaddleY -= this.aiSpeed;
            } else if (this.leftPaddleY < this.futureLeftY && this.leftPaddleY < this.gameHeight - this.paddleHeight) {
                this.leftPaddleY += this.aiSpeed;
            }
        }
        
        if ((this.keys['w'] || this.keys['arrowup']) && this.rightPaddleY > 0)
            this.rightPaddleY -= this.paddleSpeed;

        if ((this.keys['s'] || this.keys['arrowdown']) && this.rightPaddleY < this.gameHeight - this.paddleHeight)
            this.rightPaddleY += this.paddleSpeed;
    }

    changeDir(dirx)
    {
        if (dirx)
            this.ballDirectionX *= -1;
        else
            this.ballDirectionY *= -1;
        this.ballSpeedX += 0.2;
        this.ballSpeedY += 0.2;
    }

    async moveBall() {
        this.ballX += this.ballSpeedX * this.ballDirectionX;
        this.ballY += this.ballSpeedY * this.ballDirectionY;

        if (this.ballY <= 0 || this.ballY >= this.gameHeight - this.ballSize)
            this.changeDir(0);
        if (this.ballX <= this.paddleWidth && this.ballY >= this.leftPaddleY && this.ballY <= this.leftPaddleY + this.paddleHeight)
            this.changeDir(1);
        if (this.ballX >= this.gameWidth - this.paddleWidth - this.ballSize && this.ballY >= this.rightPaddleY && this.ballY <= this.rightPaddleY + this.paddleHeight)
            this.changeDir(1);

        if (this.ballX <= 0)
        {
            this.rightScore++;
            await this.resetBall();
        }
        if (this.ballX >= this.gameWidth)
        {
            this.leftScore++;
            await this.resetBall();
        }
    }

    async resetBall() {
        clearInterval(this.iaInterval);
        this.iaInterval = setInterval(this.iaPredict, 1000, this);
        this.leftPaddleY = this.gameHeight / 2 - this.paddleHeight / 2;
        this.rightPaddleY = this.gameHeight / 2 - this.paddleHeight / 2;
        this.ballX = this.gameWidth / 2;
        this.ballY = this.gameHeight / 2;
        this.ballDirectionX *= -1;
        this.ballDirectionY = Math.floor(Math.random() * 2) == 0? -1: 1;
        this.ballSpeedX = 3;
        this.ballSpeedY = 2;
        if (this.leftScore != WIN && this.rightScore != WIN)
            await this.doCountdown();
    }
}

customElements.define('pong-ai', PongAI);

export default function gameai (id) {
    if (id)
    {
        // gameid = id;
        let test = id.id.split('/');
        if (test)
            gameid = test[1].split('-');
    }
    return ('<pong-ai></pong-ai>');
}