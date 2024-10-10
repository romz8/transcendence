import {setGameEnded, initializeElements, startCountdown} from '../pages/gameRem.js'
import {displayLeave, displayForfeitMessage, displayOverMessage} from './gameDisplay.js'
import {statusDisplay, roleDisplay, Display} from "../pages/gameRem.js";
import {setGoal, setState, moveLoop} from "../pages/gameRem.js";
import { getCookie } from '../user_login.js';
import { toastNotifications } from '../main.js';
import { router } from '../routes.js';
import i18next from 'i18next';

export let ws;
export let updateReceived;

async function renderRoomNotFound(container) {

    const roomNotFoundContainer = document.createElement('div');
    roomNotFoundContainer.className = 'room-not-found container d-flex flex-column align-items-center justify-content-center text-center';

    roomNotFoundContainer.innerHTML = /* html */`
        <h1>${i18next.t('room_not_found')}</h1>
        <div class="message my-4">${i18next.t('room_not_found_info')}</div>
        <button class="btn btn-outline-secondary mt-4" id="backToHomeButton">${i18next.t('back_to_home')}</button>
    `;

    container.appendChild(roomNotFoundContainer);

    const backToHomeButton = document.getElementById('backToHomeButton');
    backToHomeButton.addEventListener('click', () => {
        history.pushState(null, "", "/");
        router();
    });
}


export async function setWebsocket(id) {
    
    const token = await getCookie('token');
    const host = window.location.hostname;
    let url = `wss://${host}:3001/tourapi/ws/pingpong/`+ id + "/";
    url += "?token=" + token;
    ws = new WebSocket(url);

    ws.onopen = () => {
        statusDisplay.textContent = i18next.t('connected'); 
    };

    ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.error)
        {
            const mainContainer = document.getElementById("mainContainer");
            mainContainer.innerHTML = '';
            renderRoomNotFound(mainContainer);
        }
        if (data.type === "init") {
            let role = data.role;
            if (role == 'player1') {
                document.getElementById('player1-name').textContent = data.playerName;
                document.getElementById('player1-name').classList.add('highlight');
            }
            else {
                document.getElementById('player2-name').textContent = data.playerName;
                document.getElementById('player2-name').classList.add('highlight')
            }
            initializeElements(data);
        }

        else if (data.type == 'start_countdown')
        {
            document.getElementById('player1-name').textContent = data.players.player1;
            document.getElementById('player2-name').textContent = data.players.player2;
            await startCountdown(data.count);
        }
        else if (data.type == 'update') {
            await setState(data);
            moveLoop()
        }
        else if (data.type == 'goal') {
            setGoal(data);     
        }
        if (data.roomstate) {
            switch (data.roomstate) {
                case "playing":
                    //renderPlaying(data);
                    break;
                case "close":
                    displayLeave(data.message);
                    ws.close();
                    setGameEnded();
                    break;
                case "quit":
                    displayForfeitMessage(data);
                    ws.close();
                    setGameEnded();
                    break;
                case "over":
                    displayOverMessage(data);
                    ws.close();
                    setGameEnded();
                    break;
                default:
                    break;
            }
        }
    };

    ws.onclose = () => {
        statusDisplay.textContent = i18next.t('disconnected');
    };

    ws.onerror = (error) => {
        statusDisplay.textContent = `Error: ${error.message}`;
    };

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        ws.send(JSON.stringify({ event_type: 'player_quit', logout: true }));
    });
}