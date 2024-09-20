import {createTournament, getTournament, deleteTournament, joinTournament, getListTournament} from "../api.js"
import {router} from "../routes.js"

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
      <h1>Tournament</h1>
      `;

    if (this.hasTournament){
        let getTournament = await getTournament();
        if (this.hasTournament){
          this.innerHTML += /* html */`<h2>${getTournament.genId}</h2>`
            this.hasTournament = true;
        }
    }

    let createTournamentButton = addGameButton('create-tour', "Create Tournament", "/tournament/create", this);
    let joinTournamentButton = addGameButton('join-tour', "Join Tournament", "/tournament/join", this);
    console.log(createTournamentButton)
    console.log(joinTournamentButton)
    if (this.hasTournament){
        // createGameButton.className += " disabled"; ?????????????
        // joinGameButton.className += " disabled"; ?????????
        var deleteButton = addGameButton('delete-tour', "Delete Waiting Room", "/waitroom/delete", this);
        deleteButton.addEventListener('click', waitRoomView);
    }

    const path = window.location.pathname;
    console.log("inside the waitRoomView, the path is ", path);
    let resp = null;
    switch(path){
        case "/tournament/create":
            await createModale(); //- TO IMPLEMENT : size and N humans
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
    if (!Array.isArray(allTour) || allTour.length === 0){
        alert('No Tournaments are Open to register');
    }

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = /* html */`
    <div class="modal fade" id="TournModal" tabindex="-1" aria-labelledby="TournModalLabel" aria-hidden="true">
    <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="TournModalLabel">Select a Tournament</h5>
      </div>
      <div class="modal-body">
      <ul class="list-group" id="roomList">
      ${allTour.map(room => `<li class="list-group-item room-item" data-room-id="${room.id}">ROOM : ${room.id} - with ${room.n_registered}/${room.size} registered</li>`).join('')}
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
    const existingModal = document.getElementById('TournModal');
    if (existingModal) {
        existingModal.remove();
    }   
    document.body.appendChild(modalContainer);
    
    // Initialize and show the modal using Bootstrap's JavaScript API
    const TournModal = new bootstrap.Modal(document.getElementById('TournModal'));
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
    document.getElementById('modalSubmitButton').addEventListener('click', async function () {
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
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="tournamentModalLabel">Tournament Settings</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <!-- Tournament Size Selection -->
            <div class="form-group">
              <label for="tournamentSize">Tournament Size</label>
              <select class="form-control" id="tournamentSize"">
                <option value="4">4 Players</option>
                <option value="8">8 Players</option>
              </select>
            </div>
            <!-- Number of Human Players Slider -->
            <div class="form-group">
              <label for="numHumans">Number of Humans: <span id="numHumansLabel">2</span></label>
              <input type="range" class="form-control-range" id="numHumans" min="1" max="4" value="2">
            </div>
            <!-- Number of AI Players Display -->
            <div class="form-group">
              <label for="numAI">Number of AIs: <span id="numAI">2</span></label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" id="modalCreateButton">Create</button>
          </div>
        </div>
      </div>
    </div>`;

    document.body.appendChild(modalContainer);
    
    // Initialize and show the modal using Bootstrap's JavaScript API
    const TournModal = new bootstrap.Modal(document.getElementById('tournamentModal'));
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
            console.log("tournamentId creation resp is: ", resp);
            if (resp.error)
            {
                displayError(resp.error);
                return;
            }
            let tournamentId = resp.id;
            console.log("tournamentId is : ", tournamentId);
            history.pushState(null,"","/tournament/" + tournamentId);
            router();
            console.log('Tournament created successfully:', resp);
        }
        catch(error){
            console.log(resp);
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