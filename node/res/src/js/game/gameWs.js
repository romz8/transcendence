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
    // Crear un contenedor para el mensaje de sala no encontrada
    const roomNotFoundContainer = document.createElement('div');
    roomNotFoundContainer.className = 'room-not-found container d-flex flex-column align-items-center justify-content-center text-center';

    // Añadir el mensaje de error y el botón
    roomNotFoundContainer.innerHTML = /* html */`
        <h1>${i18next.t('room_not_found')}</h1>
        <div class="message my-4">${i18next.t('room_not_found_info')}</div>
        <button class="btn btn-outline-secondary mt-4" id="backToHomeButton">${i18next.t('back_to_home')}</button>
    `;

    // Agregar el contenedor al DOM
    container.appendChild(roomNotFoundContainer);

    // Evento para el botón
    const backToHomeButton = document.getElementById('backToHomeButton');
    backToHomeButton.addEventListener('click', () => {
        history.pushState(null, "", "/"); // Redirigir a la página de inicio
        router(); // Llamar a la función del enrutador
    });
}


export async function setWebsocket(id) {
    
    const token = await getCookie('token');
    const host = window.location.hostname;
    let url = `wss://${host}:3001/tourapi/ws/pingpong/`+ id + "/";
    //let url = 'ws://10.11.5.6:8000/ws/pingpong/'+ id + "/"; 
    url += "?token=" + token;
    console.log("url is : ", url);
    ws = new WebSocket(url);

    console.log(ws);

    ws.onopen = () => {
        // To Replace with WebSocket server address AND dedicated room from waitroom
        statusDisplay.textContent = i18next.t('connected');

    
    };

    ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log("message received is : ", data);
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
            console.log("message received is : ", data);
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