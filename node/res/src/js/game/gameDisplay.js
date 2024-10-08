import {player, playerName, gameEnded} from '../pages/gameRem.js'
import { router } from '../routes.js';

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

function parseUrl(url) {
    const urlObj = new URL(url);

    const path = urlObj.pathname;
    
    if (path.startsWith('/game/t')) {
        const numSegment = path.split('/').pop();
        const [firstNum, secondNum] = numSegment.split('-');
        return secondNum;
    }
    return null;
}

export function displayOverMessage(data) {
    
    console.log(data);
    let messageStyle, homeButton = '', tournamentButton = '';
    const idTour = parseUrl(window.location.href)
    if (idTour){
        tournamentButton =/*html*/ `<button id="tournament-btn" class="btn btn-primary mt-3">Ir al Torneo</button>`
    }
    else{
        homeButton = /*html*/`<button id="home-btn" class="btn btn-warning mt-3">Go Home</button>`;
    }
    if (player == data.winner) {
        messageStyle = "text-success";
    } else {
        messageStyle = "text-danger";
        homeButton = /*html*/`<button id="home-btn" class="btn btn-warning mt-3">Go Home</button>`;
    }

    const mainContainer = document.getElementById('mainContainer');

    mainContainer.innerHTML = /* html */`
        <div class="text-center mt-5">
            <h2 class="${messageStyle}">${player == data.winner ? 'You won!' : 'You lost!'}</h2>
            <p>
                ${document.getElementById('player1-name').textContent} ${data.score.player1} - 
                ${document.getElementById('player2-name').textContent} ${data.score.player2}
            </p>
            ${tournamentButton}
            ${homeButton}
        </div>
    `;

    // Añadir eventos a los botones
    console.log(window.location.href);
    console.log(parseUrl(window.location.href));
    if (idTour){

        document.getElementById('tournament-btn').addEventListener('click', () => {
            window.location.href = `/tournament/${idTour}`;
        });
    }
    if (document.getElementById('home-btn')) {
        document.getElementById('home-btn').addEventListener('click', () => {
            history.pushState('', '', '/');
            router();
        });
    }
}
