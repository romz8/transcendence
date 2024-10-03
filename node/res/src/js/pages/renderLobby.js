import { t } from "i18next";
import { getWaitRoom, leaveWaitRoom } from "../api.js";
import { router } from "../routes.js";

let lobbyId = -1;

class RenderLobby extends HTMLElement{
    constructor() {
        super();
    }
    async connectedCallback(){
      this.innerHTML='<nav-bar data-authorized></nav-bar>' 
        let waitRoom = await getWaitRoom(lobbyId);
        if (waitRoom.error) {
            displayError(waitRoom.error, this);
            return;
        }
        this.innerHTML += /*html*/`
            <div id="status-banner" class="mt-4"></div>
            <div id="mainContainer" class="container d-flex flex-column align-items-center justify-content-center text-center">
                <h1>Waiting Room</h1>
                <div class="lobby-container">
                    <div class="owner-column">
                        <h2>Room Owner</h2>
                        <p>${waitRoom.owner.alias}</p>
                    </div>
                    <div id="attendee" class="attendee-column">
                        <h2>Attendee</h2>
                        <p></p>
                    </div>
                </div>
                <button id="search-btn" class="btn btn-outline-cream btn-general d-flex align-items-center justify-content-center gap-3 mb-3">Search Opponent</button>
                <button id="leave-btn" class="btn btn-danger btn-general d-flex align-items-center justify-content-center gap-3 mb-3">Leave Room</button>
                <div id="timer"></div>
            </div>
        `
        const attendeeColumn = document.getElementById("attendee");
        if (waitRoom.attendee) {
            const attendeeContainer = document.createElement("div");
            attendeeContainer.className = "attendee-container";
        
            const attendeeName = document.createElement("p");
            attendeeName.innerText = waitRoom.attendee.alias;
            attendeeContainer.appendChild(attendeeName);
        
            attendeeColumn.appendChild(attendeeContainer);
        } else {
            const noAttendeesMsg = document.createElement("p");
            noAttendeesMsg.innerText = "No attendees yet.";
            attendeeColumn.appendChild(noAttendeesMsg);
        }
        const searchOponent = document.getElementById("search-btn");
        searchOponent.addEventListener("click", async function () {
          waitRoom = await getWaitRoom(lobbyId);
          if (waitRoom.error) {
              displayError(waitRoom.error, this);
              return;
          }
          displayBanner(waitRoom, lobbyId);
        });
        const leaveBtn = document.getElementById("leave-btn");
        leaveBtn.addEventListener("click", async function () {
            const resp = await leaveWaitRoom(lobbyId);
            if (resp.error) {
               displayError(resp.error);
            } else {
                history.pushState(null, "", "/");
                router();
            }
        });
      displayBanner(waitRoom, lobbyId);
      startCountdown(waitRoom.expire_at, lobbyId);
    }

}

customElements.define('render-lobby', RenderLobby);

export default function renderLobby(id) {
    if (id == undefined)
    {
        history.pushState(null,"","/");
        router();
        return;
    }
    lobbyId = id.id
    return('<render-lobby></render-lobby>')
}

// Function to display the banner
function displayBanner(waitRoom, id) {
  const bannerDiv = document.getElementById("status-banner");

  if (waitRoom.owner && waitRoom.attendee) {
    // Both players are present
    bannerDiv.innerHTML = `
      <div class="alert alert-info text-center" role="alert">
        Both players are present! Ready to start the game.
        <button class="btn btn-primary ml-2" id="startGameButton">Play</button>
      </div>
    `;
    const playButton = document.getElementById("startGameButton");
    playButton.addEventListener("click", () => {
      history.pushState(null, "", "/game/g/" + id);
      router();
    });
  } else {
    // Waiting for opponent
    bannerDiv.innerHTML = `
      <div class="alert alert-warning text-center" role="alert">
        Waiting for an opponent to join...
      </div>
    `;
  }
}

// Function to start the countdown timer
function startCountdown(expireAt) {
    const timerDiv = document.getElementById("timer");

    // Parse expire_at to Date object
    const expireTime = new Date(expireAt);

    function updateTimer() {
        const now = new Date();
        const timeRemaining = expireTime - now;

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerDiv.innerText = "This room has expired.";
            return;
        }

        // Calculate time components
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        // Format time string
        const timeString = `Time remaining: ${hours
        .toString()
        .padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        // Update timer display
        timerDiv.innerText = timeString;
    }

    // Update timer immediately and then every second
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
}

export function displayError(message, self) {
  self.innerHTML += /*html*/`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 100vh;">
      <div class="error-card card text-center p-4 shadow" style="max-width: 400px; border-radius: 10px;">
        <div class="card-body">
          <div class="error-icon mb-4" style="font-size: 4rem; color: var(--bs-danger);">⚠️</div>
          <h4 class="card-title text-danger">Error</h4>
          <p class="card-text mb-4">${message}</p>
          <button id="backToHome" class="btn btn-outline-secondary mt-3">Volver a Inicio</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('backToHome').addEventListener('click', () => {
    history.pushState(null, "", "/");
    router();
  });
}