class PongGame extends HTMLElement {
    constructor() {
        super();
        this.gameWidth = 800;
        this.gameHeight = 400;
        this.paddleHeight = 75;
        this.paddleWidth = 10;
        this.ballSize = 10;
        this.paddleSpeed = 5;
        this.ballSpeedX = 5;
        this.ballSpeedY = 3;
        this.aiSpeed = 5;

        this.leftPaddleY = this.gameHeight / 2 - this.paddleHeight / 2;
        this.futureLeftY = this.gameHeight / 2 - this.paddleHeight / 2;
        this.leftPaddleX = 10;
        this.rightPaddleY = this.gameHeight / 2 - this.paddleHeight / 2;
        this.rightPaddleX = 790;
        this.ballX = this.gameWidth / 2;
        this.ballY = this.gameHeight / 2;
        this.ballDirectionX = Math.floor(Math.random() * 2) == 0? -1: 1;
        this.ballDirectionY = Math.floor(Math.random() * 2) == 0? -1: 1;

        this.leftScore = 0;
        this.rightScore = 0;

        this.keys = {};
    }

    connectedCallback() {
        this.innerHTML = /*html*/`
        <style>
            .game-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${this.gameWidth}px;
            height: ${this.gameHeight}px;
            background-color: black;
            }
            .paddle {
            position: absolute;
            width: ${this.paddleWidth}px;
            height: ${this.paddleHeight}px;
            background-color: white;
            }
            #leftPaddle {
            left: 0;
            }
            #rightPaddle {
            right: 0;
            }
            .ball {
            position: absolute;
            width: ${this.ballSize}px;
            height: ${this.ballSize}px;
            background-color: white;
            border-radius: 50%;
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
        </style>
        <nav-bar data-authorized></nav-bar>
        <div class="game-container">
            <div class="scoreboard" id="scoreboard">0 - 0</div>
            <div id="leftPaddle" class="paddle"></div>
            <div id="rightPaddle" class="paddle"></div>
            <div class="ball"></div>
        </div>
        `;

        this.leftPaddle = document.getElementById('leftPaddle');
        this.rightPaddle = document.getElementById('rightPaddle');
        this.ball = document.querySelector('.ball');
        this.scoreboard = document.getElementById('scoreboard');

        this.updatePositions();
        this.startGame();
    }

    updatePositions() {
        this.leftPaddle.style.top = `${this.leftPaddleY}px`;
        this.rightPaddle.style.top = `${this.rightPaddleY}px`;
        this.ball.style.left = `${this.ballX}px`;
        this.ball.style.top = `${this.ballY}px`;
        this.scoreboard.textContent = `${this.leftScore} - ${this.rightScore}`;
    }
    
    setTimeLoop(obj) {
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

    startGame() {
        document.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);        
        
        const gameLoop = () => {
            this.movePaddles();
            this.moveBall();
            this.updatePositions();
            if (this.checkWinner() == false)
                requestAnimationFrame(gameLoop);
        };
        setInterval(this.setTimeLoop, 1000, this);
        gameLoop();
    }

    checkWinner(){
        if (this.leftScore == 5 )
        {
            alert("AI WON GIT GUD")
            return true;
        }
        else if (this.rightScore == 5 )
        {
            alert ("LUCKY GUY YOU WON")
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
        if (this.keys['w'] && this.rightPaddleY > 0)
            this.rightPaddleY -= this.paddleSpeed;

        if (this.keys['s'] && this.rightPaddleY < this.gameHeight - this.paddleHeight)
            this.rightPaddleY += this.paddleSpeed;

        // if (this.ballDirectionX > 0 && this.ballY < this.rightPaddleY + this.paddleHeight / 2 && this.rightPaddleY > 0)
        //     this.rightPaddleY -= this.aiSpeed;
        // else if (this.ballDirectionX > 0 && this.ballY > this.rightPaddleY + this.paddleHeight / 2 && this.rightPaddleY < this.gameHeight - this.paddleHeight)
        //     this.rightPaddleY += this.aiSpeed;
    }

    changeDir(dirx)
    {
        if (dirx)
            this.ballDirectionX *= -1;
        else
            this.ballDirectionY *= -1;
        this.ballSpeedX += 0.1;
        this.ballSpeedY += 0.1;
    }

    moveBall() {
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
            this.resetBall();
        }
        if (this.ballX >= this.gameWidth - this.ballSize)
        {
            this.leftScore++;
            this.resetBall();
        }
    }

    resetBall() {
        this.leftPaddleY = this.gameHeight / 2 - this.paddleHeight / 2;
        this.rightPaddleY = this.gameHeight / 2 - this.paddleHeight / 2;
        this.ballX = this.gameWidth / 2;
        this.ballY = this.gameHeight / 2;
        this.ballDirectionX *= -1;
        this.ballDirectionY = Math.floor(Math.random() * 2) == 0? -1: 1;
        this.ballSpeedX = 5;
        this.ballSpeedY = 3;
    }
}

customElements.define('pong-game', PongGame);

export default function game () {
    return ('<pong-game></pong-game>');
}