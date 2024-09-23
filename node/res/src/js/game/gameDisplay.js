import {player, playerName, gameEnded} from '../pages/gameRem.js'

export function displayCountdown(number) {
    if (!gameEnded) {
        const countdownElement = document.getElementById('countdown');
        countdownElement.textContent = number;
    }
}

export function updateScores(data) {
    document.getElementById('player1-score').textContent = `Score: ${data.score.player1}`;
    document.getElementById('player2-score').textContent = `Score: ${data.score.player2}`;
}

export function displayForfeitMessage(data) {

    let text;
    let c_style;

    if (playerName == data.player) {
        c_style = "bg-danger";
        text = "You lost the game by forfeit!"
    }
    else {
        c_style = "bg-success";
        text = "You won the game by forfeit!"
    }

    const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = /* html */`
        <div class="card text-white mb-3 ${c_style}" style="max-width: 18rem;">
            <div class="card-header">Game Over</div>
            <div class="card-body">
                <h5 class="card-title">Player Forfeit</h5>
                <p class="card-text">${data.message}</p>
                <p class="card-text">${text}</p>
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

    let card_title, c_style;

    if (player == data.winner) {
        card_title = 'You won!';
        c_style = "bg-success";
    }
    else {
        card_title = 'You lost!'
        c_style = "bg-danger";
    }
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = /* html */`
        <div class="card text-whitemb-3 ${c_style}" style="max-width: 18rem;">
            <div class="card-header">Game Over </div>
            <div class="card-body">
                <h5 class="card-title">${card_title}</h5>
                <p class="card-text">${document.getElementById('player1-name').textContent} ${data.score.player1} - ${document.getElementById('player2-name').textContent} ${data.score.player2}</p>
            </div>
        </div>
    `;
}