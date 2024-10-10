import {createTournament, getTournament, deleteTournament, joinTournament, getListTournament} from "../api.js"
import { generateLangs } from "../languages.js";
import {router} from "../routes.js"
import { Modal } from 'bootstrap'; // Importar los módulos JS específicos que necesites
import i18next from 'i18next';

class TournamentRoom extends HTMLElement {
  constructor() {
    super();
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
        <h1  data-translate="text" data-key="tournament">Tournament</h1>
        <div id="main-container" class="d-flex justify-content-center gap-3 mt-3">

        </div>
      </div>
        `;
    generateLangs();
    const mainContainer = document.getElementById("main-container")
    if (this.hasTournament){
        let tourn = await getTournament();
        if (this.hasTournament){
          
          this.innerHTML += /* html */`<h2>${tourn.genId}</h2>`
            this.hasTournament = true;
        }
    }

    let createTournamentButton = addGameButton('create-tour', i18next.t('create_tour'), "/tournament/create", mainContainer);
    let joinTournamentButton = addGameButton('join-tour', i18next.t('join_tour'), "/tournament/join", mainContainer);
    console.log(createTournamentButton)
    console.log(joinTournamentButton)
    if (this.hasTournament){
        var deleteButton = addGameButton('delete-tour',  i18next.t('delete_wait_room'), "/waitroom/delete", mainContainer);
        deleteButton.addEventListener('click', waitRoomView);
    }
    const path = window.location.pathname;
    let resp = null;
    switch(path){
        case "/tournament/create":
            await createModale();
            break;
        case "/tournament/join":
            await joinModale();
            break;
        default: 
            break;
    };
  }
}

customElements.define('tournament-room', TournamentRoom);

export default function tournamentRoom () {
  return (`<tournament-room></tournament-room>`);
}

function addGameButton(id, name, path, self){
  self.innerHTML += /* html */`<a id="${id}" class="btn btn-primary" href=${path} type="button" data-link>${name}</a>`;
  let GameButton = document.getElementById(id);
  return GameButton;
}

async function joinModale(){
    let allTour = await getListTournament();
    const modalContainer = document.createElement('div');
    if (!Array.isArray(allTour) || allTour.length === 0){
      modalContainer.innerHTML = /* html */`
      <div class="modal fade" id="TournModal" tabindex="-1" aria-labelledby="TournModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title" id="TournModalLabel">${i18next.t('select_tour')}</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <h6>${i18next.t('no_tour')}</h6>
            </div>
            <div class="modal-footer d-flex justify-content-left">
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal">${i18next.t('close')}</button>
            </div>
          </div>
        </div>
      </div>  
      `
    }
    else
    {
      modalContainer.innerHTML = /* html */`
      <div class="modal fade" id="TournModal" tabindex="-1" aria-labelledby="TournModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title" id="TournModalLabel">${i18next.t('select_tour')}</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <ul class="list-group" id="roomList">
                ${allTour.map(room => /* html */`
                  <li class="list-group-item d-flex justify-content-between align-items-center room-item" data-room-id="${room.id}">
                    <span class="">ROOM: ${room.id}</span>
                    <span class="badge bg-secondary">${room.n_registered}/${room.size} ${i18next.t("registred")}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
            <div class="modal-footer d-flex justify-content-between">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
              <button type="button" class="btn btn-primary" id="modalSubmitButton">Enviar</button>
            </div>
          </div>
        </div>
      </div>  
      `;
    }
    // Remove any existing modal container to avoid duplicates
    const existingModal = document.getElementById('TournModal');
    if (existingModal) {
      existingModal.remove();
    } 
    document.body.appendChild(modalContainer);
    const subBtn = document.getElementById('modalSubmitButton');
    if(subBtn){
      subBtn.addEventListener('click', async function () {
          if (selectedRoomId) {
              TournModal.hide(); // Hide the modal
              const resp = await joinTournament(selectedRoomId);
              if (resp) {
                  // Handle successful join
                  console.log('Joined room:', resp);
                  history.pushState(null,"","/tournament/" + resp.tournament);
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

    
    // Initialize and show the modal using Bootstrap's JavaScript API
    const TournModal = new Modal(document.getElementById('TournModal'));
    TournModal.show();
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
    
    // Add event listener to the modal submit button
    });
}

async function createModale(){

    // Remove any existing modal container to avoid duplicates
    const existingModal = document.getElementById('tournamentModal');
    if (existingModal) {
        existingModal.remove();
    }   

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML= /* html */`
    <!-- Tournament Settings Modal -->
    <div class="modal fade" id="tournamentModal" tabindex="-1" aria-labelledby="tournamentModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="tournamentModalLabel">${i18next.t('conf_tourn')}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Selección del tamaño del torneo -->
            <div class="mb-3">
              <label for="tournamentSize" class="form-label">${i18next.t('size_tourn')}</label>
              <select class="form-select" id="tournamentSize">
                <option value="4">4 ${i18next.t('players')}</option>
                <option value="8">8 ${i18next.t('players')}</option>
              </select>
            </div>
            <!-- Slider para número de jugadores humanos -->
            <div class="mb-3">
              <label for="numHumans" class="form-label">${i18next.t('n_humans')}<span id="numHumansLabel">2</span></label>
              <input type="range" class="form-range" id="numHumans" min="1" max="4" value="2" oninput="document.getElementById('numHumansLabel').textContent = this.value;">
            </div>
            <!-- Número de jugadores de IA -->
            <div class="mb-3">
              <label class="form-label">${i18next.t('n_ias')}<span id="numAI">2</span></label>
            </div>
          </div>
          <div class="modal-footer d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${i18next.t('close')}</button>
            <button type="button" class="btn btn-primary" id="modalCreateButton">${i18next.t('create')}</button>
          </div>
        </div>
      </div>
    </div>
`;

    document.body.appendChild(modalContainer);
    
    // Initialize and show the modal using Bootstrap's JavaScript API
    const TournModal = new Modal(document.getElementById('tournamentModal'));
    TournModal.show();

    // Dynamically attach the event handlers
    document.getElementById('tournamentSize').addEventListener('change', updateSliderMax);
    document.getElementById('numHumans').addEventListener('input', updateAI);
    
    

    document.getElementById('modalCreateButton').addEventListener('click', async function(){
        const size = document.getElementById('tournamentSize').value;
        const n_humans = document.getElementById('numHumans').value;
        TournModal.hide();    
        try{
            const resp = await createTournament(size, n_humans);
            if (resp.error)
            {
                displayError(resp.error);
                return;
            }
            let tournamentId = resp.id;
            history.pushState(null,"","/tournament/" + tournamentId);
            router();
        }
        catch(error){
            console.log(error);
        }
    })

}

// Functions to dynamically update the modal inputs
function updateSliderMax() {
    const tournamentSize = document.getElementById('tournamentSize').value;
    const numHumansSlider = document.getElementById('numHumans');

    // Update the maximum number of human players allowed
    numHumansSlider.max = tournamentSize;
    numHumansSlider.value = Math.min(numHumansSlider.value, tournamentSize);

    // Update the human players label and AI count
    document.getElementById('numHumansLabel').textContent = numHumansSlider.value;
    updateAI();
}

function updateAI() {
    const tournamentSize = parseInt(document.getElementById('tournamentSize').value);
    const numHumans = parseInt(document.getElementById('numHumans').value);

    // Calculate the number of AI players
    const numAI = tournamentSize - numHumans;

    // Update the AI count display
    document.getElementById('numAI').textContent = numAI;
    document.getElementById('numHumansLabel').textContent = numHumans;
}


// Function to display an error message in a stylish card
function displayError(message) {
    const errorContainer = document.getElementById('mainContainer');
    // Clear any previous error messages
    errorContainer.innerHTML = '';

    // Create the error card element
    const errorCard = document.createElement('div');
    errorCard.className = 'error-card';

    // Add the error icon (you can replace this with an actual icon if desired)
    const errorIcon = document.createElement('span');
    errorIcon.className = 'error-icon';
    errorIcon.innerHTML = '⚠️'; // Unicode warning sign
    errorCard.appendChild(errorIcon);

    // Add the error message text
    const errorMessage = document.createElement('span');
    errorMessage.textContent = message;
    errorCard.appendChild(errorMessage);

    // Append the error card to the error container
    errorContainer.appendChild(errorCard);
}