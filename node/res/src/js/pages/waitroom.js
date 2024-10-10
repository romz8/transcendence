import {createWaitRoom, getWaitRoom, getListWaitRoom, deleteWaitRoom, joinWaitRoom} from '../api.js';
// import {createTournament, getTournament, deleteTournament, joinTournament} from "../api.js"
import {router} from '../routes.js';
import i18next from 'i18next';
import { Modal } from 'bootstrap';
import { generateLangs } from '../languages.js';

async function renderLobby(){
	const modalContainer = document.createElement('div');
    
    let availableRooms = await getListWaitRoom();
    if (!Array.isArray(availableRooms) || availableRooms.length === 0) {
        modalContainer.innerHTML = /* html */`
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="exampleModalLabel">${i18next.t("selector_game")}</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p>${i18next.t("no_rooms")}</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${i18next.t("close")}</button>
              </div>
            </div>
          </div>
        </div>
        `;
        const existingModal = document.getElementById('exampleModal');
        if (existingModal) {
            existingModal.remove();
        }   
        document.body.appendChild(modalContainer);
    
        // Initialize and show the modal using Bootstrap's JavaScript API
        const exampleModal = new Modal(document.getElementById('exampleModal'));
        exampleModal.show();
        // Remo
        return; // Exit if no rooms are available
    }
    modalContainer.innerHTML = /* html */`
    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="exampleModalLabel">${i18next.t("selector_game")}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <ul class="list-group" id="roomList">
                ${availableRooms.map(room => /*html*/`
                <li class="list-group-item d-flex justify-content-between align-items-center room-item" data-room-id="${room.genId}">
                    <span class="">ROOM: ${room.genId}</span>
                </li>
                `).join('')}
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${i18next.t("close")}</button>
            <button type="button" class="btn btn-primary" id="modalSubmitButton">${i18next.t("submit")}</button>
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

    const exampleModal = new Modal(document.getElementById('exampleModal'));
    exampleModal.show();

	let selectedRoomId = null; // Variable to store the selected room ID

	// Add event listeners to each room item
	document.querySelectorAll('.room-item').forEach(item => {
		item.addEventListener('click', function() {
			// Remove 'active' class from all items and add it to the clicked item
			document.querySelectorAll('.room-item').forEach(el => el.classList.remove('active'));
			this.classList.add('active');
			selectedRoomId = this.getAttribute('data-room-id'); // Set the selected room ID
		});
	});

	// Add event listener to the modal submit button
	document.getElementById('modalSubmitButton').addEventListener('click', async function () {
		if (selectedRoomId) {
			exampleModal.hide(); // Hide the modal
			const resp = await joinWaitRoom(selectedRoomId);
			if (resp) {
				// Handle successful join
				history.pushState(null, '', '/lobby/' + selectedRoomId);
				router();
			} else {
				createToast("warning", i18next('fail_join'))

			}
		} else {
      createToast("warning", i18next('error_select_room'))
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
		super();
		this.hasRoom = false;
		this.hasTournament = false;
	}
    
	async connectedCallback() {
		this.innerHTML = /* html */`
        <nav-bar data-authorized></nav-bar>
        <main class="container">
            <div class="d-flex flex-column justify-content-center align-items-center">
                <div class="mb-5 row">
                    <h1 class="text-center krona-font" data-translate="text" data-key="waitroom">Waitroom</h1>
                    <p class="text-center" data-translate="text" data-key="waitroom_info">Create a new game or join an existing one.</p>
                </div>
              <div id="main-container" class="d-flex justify-content-center gap-3 mt-3">
                <a id="crt-game" class="btn btn-primary" href="/waitroom/create" type="button" data-link data-translate="text" data-key="create_game"></a>
                <a id="jn-game" class="btn btn-primary" href="/waitroom/join" type="button" data-link data-translate="text" data-key="join_game"></a>
            </div>
        </div>
        </main>
    `;
    generateLangs();
    let mainContainer = document.getElementById("main-container")

		const path = window.location.pathname;
		let resp = null;
		switch(path){
			case '/waitroom/create':
				resp = await createWaitRoom();
				let gameId = resp.genId;
				history.pushState(null,'','/lobby/' + gameId);
				router();
				break;
			case '/waitroom/join':
				await renderLobby();
				break;
			case '/waitroom/delete':
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