import {createWaitRoom, getWaitRoom, getListWaitRoom, deleteWaitRoom, joinWaitRoom} from "../api.js"
// import {createTournament, getTournament, deleteTournament, joinTournament} from "../api.js"
import {router} from "../routes.js"

async function renderLobby(){
    console.log('Rendering lobby');
    const modalContainer = document.createElement('div');
    
    let availableRooms = await getListWaitRoom();
    if (!Array.isArray(availableRooms) || availableRooms.length === 0) {
        console.log('No available rooms found');
        alert('No rooms are available to join.');
        return; // Exit if no rooms are available
    }
    console.log("in render the data are ")
    console.log(JSON.stringify(availableRooms));
   
    modalContainer.innerHTML = /* html */`
    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Join a Game: Select a Room</h5>
          </div>
          <div class="modal-body">
            <ul class="list-group" id="roomList">
                ${availableRooms.map(room => /*html*/`<li class="list-group-item room-item" data-room-id="${room.genId}">ROOM : ${room.genId}</li>`).join('')}
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" id="modalSubmitButton">Submit</button>
          </div>
        </div>
      </div>
    </div>
    `;
    // Remove any existing modal container to avoid duplicates
    const existingModal = document.getElementById('exampleModal');
    if (existingModal) {
        existingModal.remove();
    }   
    document.body.appendChild(modalContainer);

    // Initialize and show the modal using Bootstrap's JavaScript API
    const exampleModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    exampleModal.show();

    let selectedRoomId = null; // Variable to store the selected room ID

    // Add event listeners to each room item
    document.querySelectorAll('.room-item').forEach(item => {
        item.addEventListener('click', function() {
            // Remove 'active' class from all items and add it to the clicked item
            document.querySelectorAll('.room-item').forEach(el => el.classList.remove('active'));
            this.classList.add('active');
            selectedRoomId = this.getAttribute('data-room-id'); // Set the selected room ID
            console.log('Selected room ID:', selectedRoomId);
        });
    });

    // Add event listener to the modal submit button
    document.getElementById('modalSubmitButton').addEventListener('click', async function () {
        if (selectedRoomId) {
            exampleModal.hide(); // Hide the modal
            const resp = await joinWaitRoom(selectedRoomId);
            if (resp) {
                // Handle successful join
                console.log('Joined room:', resp);
                history.pushState(null, "", "/lobby/" + selectedRoomId);
                router();
            } else {
                // Handle join failure
                console.log('Failed to join room');
            }
        } else {
            alert('Please select a room!');
        }
    });
}

function addGameButton(id, name, path, self){
  self.innerHTML += /* html */`<a id="${id}" class="btn btn-primary" href=${path} type="button" data-link>${name}</a>`;
  let GameButton = document.getElementById(id);
  return GameButton;
}
            
class Waitroom extends HTMLElement {
    constructor() {
        super()
        this.hasRoom = false;
        this.hasTournament = false;
    }
    
    async connectedCallback() {
        this.innerHTML = /* html */`
        <style>
            div {
                color: var(--bs-cs-secondary);
            }
            h1 {
                color: var(--bs-cs-secondary);
            }
            h2 {
                color: var(--bs-cs-secondary);
            }
        </style>
        <nav-bar data-authorized></nav-bar>
        <div class="d-flex flex-column justify-content-center align-items-center">
            <h1>Wait Room</h1>
            <div id="main-container" class="d-flex justify-content-center gap-3 mt-3">

           </div>
        </div>`
        if (this.hasRoom){
            let getRoom = await getWaitRoom();
            if (getRoom){
                this.innerHTML += /* html */`<h2>${getRoom.genId}</h2>`
                this.hasRoom = true;
            }
        }
        const mainContainer = document.getElementById("main-container")
        let createGameButton = addGameButton("crt-game" ,"Create Game", "/waitroom/create", mainContainer);
        let joinGameButton = addGameButton("jn-game" ,"Join Game", "/waitroom/join", mainContainer);

        const path = window.location.pathname;
        console.log("inside the waitRoomView, the path is ", path);
        let resp = null;
        switch(path){
            case "/waitroom/create":
                resp = await createWaitRoom();
                let gameId = resp.genId;
                console.log("gameId is : ", gameId);
                history.pushState(null,"","/lobby/" + gameId);
                router();
            break;
            case "/waitroom/join":
                console.log("we are joingin");
                await renderLobby();
                break;
            case "/waitroom/delete":
                resp = await deleteWaitRoom();
                renderWaitRoom();
                break;
            default: 
                break;
        };
    }
   
}

customElements.define('wait-room', Waitroom);

export default function waitroom () {
    return ('<wait-room></wait-room>');
}