import {player, playerName, gameEnded} from '../pages/gameRem.js'
import { router } from '../routes.js';
import i18next from 'i18next';


export function displayCountdown(number) {
    if (!gameEnded) {
        const countdownElement = document.getElementById('countdown');
        countdownElement.textContent = number;
    }
}

export function displayForfeitMessage(data) {

    let text;
    let c_style;

    if (playerName == data.player) {
        c_style = "bg-danger";
        text = i18next.t("lost_forfeit")
    }
    else {
        c_style = "bg-success";
        text = i18next.t("won_forfeit")
    }

    const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = /* html */`
        <div class="card text-white mb-3 ${c_style}" style="max-width: 18rem;">
            <div class="card-header">${i18next.t('game_over')}</div>
            <div class="card-body">
                <h5 class="card-title">${i18next.t('player_forfeit')}</h5>
                <p class="card-text">${text}</p>
            </div>
        </div>
    `;
}

export function displayLeave(message) {

    const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = /* html */`
        <div class="card text-white bg-danger mb-3" style="max-width: 18rem;">
            <div class="card-header">${i18next.t('leaving_waiting_room')}</div>
            <div class="card-body">
                <h5 class="card-title">${i18next.t('you_left_room')}</h5>
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

    let messageStyle, homeButton = '', tournamentButton = '';
    const idTour = parseUrl(window.location.href)
    if (idTour){
        tournamentButton =/*html*/ `<button id="tournament-btn" class="btn btn-primary mt-3">${i18next.t('go_to_tournament')}</button>`
    }
    else{
        homeButton = /*html*/`<button id="home-btn" class="btn btn-warning mt-3">${i18next.t('back_to_home')}</button>`;
    }
    if (player == data.winner) {
        messageStyle = "text-success";
    } else {
        messageStyle = "text-danger";
        homeButton = /*html*/`<button id="home-btn" class="btn btn-warning mt-3">${i18next.t('back_to_home')}</button>`;
    }

    const mainContainer = document.getElementById('mainContainer');

    mainContainer.innerHTML = /* html */`
        <div class="text-center mt-5">
            <h2 class="${messageStyle}">${player == data.winner ? i18next.t('you_won') : i18next.t('you_lost')}</h2>
            <p>
                ${document.getElementById('player1-name').textContent} ${data.score.player1} - 
                ${document.getElementById('player2-name').textContent} ${data.score.player2}
            </p>
            ${tournamentButton}
            ${homeButton}
        </div>
    `;

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
