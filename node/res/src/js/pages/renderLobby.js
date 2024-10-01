import { getWaitRoom, leaveWaitRoom } from "../api.js";
import { router } from "../routes.js";

let lobbyId = -1;

class RenderLobby extends HTMLElement{
    constructor() {
        super();
    }
    async connectedCallback(){
        const waitRoom = await getWaitRoom(lobbyId);
        if (waitRoom.error) {
            displayError(waitRoom.error);
            return;
        }
        this.innerHTML = /*html*/`
            <div id="mainContainer">
                <div id="status-banner" class="mt-4"></div>
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
                <button id="leave-btn" class="btn btn-danger">Leave Room</button>
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
        const leaveBtn = document.getElementById("leave-btn");
        leaveBtn.addEventListener("click", async function () {
            const resp = await leaveWaitRoom(lobbyId);
            if (resp.error) {
               displayError(resp.error);
            } else {
                // Navigate to the appropriate route
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
    console.log(id)
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

// Function to display an error message in a stylish card
function displayError(message) {
  const errorContainer = document.getElementById("mainContainer");
  // Clear any previous error messages
  errorContainer.innerHTML = "";

  // Create the error card element
  const errorCard = document.createElement("div");
  errorCard.className = "error-card";

  // Add the error icon (you can replace this with an actual icon if desired)
  const errorIcon = document.createElement("span");
  errorIcon.className = "error-icon";
  errorIcon.innerHTML = "⚠️"; // Unicode warning sign
  errorCard.appendChild(errorIcon);

  // Add the error message text
  const errorMessage = document.createElement("span");
  errorMessage.textContent = message;
  errorCard.appendChild(errorMessage);

  // Append the error card to the error container
  errorContainer.appendChild(errorCard);
}
