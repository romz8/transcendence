import {ctx} from '../pages/gameRem.js'
import {constants} from './gameDeclarations.js'

export function displayCountdown(number) {
    const countdownElement = document.getElementById('countdown');
    countdownElement.textContent = number;
}

export function updateScores(data) {
    document.getElementById('player1-score').textContent = `Score: ${data.score.player1}`;
    document.getElementById('player2-score').textContent = `Score: ${data.score.player2}`;
}

export function displayForfeitMessage(message) {
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = /* html */`
        <div class="card text-white bg-danger mb-3" style="max-width: 18rem;">
            <div class="card-header">Game Over</div>
            <div class="card-body">
                <h5 class="card-title">Player Forfeit</h5>
                <p class="card-text">${message}</p>
                <p class="card-text">player lost the game by forfeit.</p>
            </div>
        </div>
    `;
}

  // Function to display the leaving message
export function displayLeave(message) {
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = /* html */`
        <div class="card text-white bg-danger mb-3" style="max-width: 18rem;">
            <div class="card-header">Leaving Waiting Room</div>
            <div class="card-body">
                <h5 class="card-title">You left the Room</h5>
                <p class="card-text">${message}</p>
            </div>
        </div>
    `;
}

export function displayOverMessage(data) {
    console.log("in Over Message");
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = /* html */`
        <div class="card text-white bg-danger mb-3" style="max-width: 18rem;">
            <div class="card-header">Game Over </div>
            <div class="card-body">
                <h5 class="card-title">Party is over !</h5>
                <p class="card-text">The winner is ${data.winner}</p>
                <p class="card-text">The score is ${data.score.player1} - ${data.score.player2}</p>
                <p class="card-text">${data.message}</p>
            </div>
        </div>
    `;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

export function drawPitch() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resizeCanvas();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    //top and bottom lines
    ctx.beginPath();
    ctx.moveTo(constants.PADDING, constants.PADDING);
    ctx.lineTo(constants.PITCHWIDTH + constants.PADDING, constants.PADDING);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(constants.PADDING, constants.PITCHHEIGHT + constants.PADDING);
    ctx.lineTo(constants.PITCHWIDTH + constants.PADDING, constants.PITCHHEIGHT + constants.PADDING);
    ctx.stroke();
    ctx.closePath();

    // center line dashed
    ctx.beginPath();
    ctx.setLineDash([5, 10]);
    ctx.moveTo(constants.PITCHWIDTH / 2 + constants.PADDING, constants.PADDING);
    ctx.lineTo(constants.PITCHWIDTH / 2 + constants.PADDING, constants.PITCHHEIGHT + constants.PADDING);
    ctx.stroke();
    ctx.closePath();

    //goal lines dashed
    ctx.beginPath();
    ctx.moveTo(constants.PADDING, constants.PADDING);
    ctx.lineTo(constants.PADDING, constants.PITCHHEIGHT + constants.PADDING);
    ctx.moveTo(constants.PITCHWIDTH + constants.PADDING, constants.PADDING);
    ctx.lineTo(constants.PITCHWIDTH + constants.PADDING, constants.PITCHHEIGHT + constants.PADDING);
    ctx.stroke();
    ctx.closePath();

    ctx.setLineDash([]);
}