import { getTournament, getAuth, getPlayerListTournament, getMatchesListTournament, getPlayerTournnamentActive, putMatchTest} from "../api.js";
import {router} from "../routes.js"

let id = -1;
let maxPlayers = null; // Maximum number of players (can be 4 or 8 based on the game rules)
let registered = null; // Number of currently registered
let state = null;
let bannerState = null;

class Tournament extends HTMLElement {
    constructor() {
        super();
        // Variable to store the interval ID
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
        .match-details{
            background-color: #212529; /* Fondo de la caja */
            padding: 30px;
            margin: 10px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
        }
        .player{
            color:white;
            text-transform: uppercase;
        }
        </style>
        <nav-bar data-authorized></nav-bar>
        <div id="main-container"></div>
        `;
        this.container = document.getElementById('main-container')
        while (window.location.pathname == `/tournament/${id}`) {
            await renderLoop(id, this.container); // Fetch and render updates
            await delay(1000); // Wait for 1 seconds
        }
    }
}
  
customElements.define('tourna-ment', Tournament);

export default function tournament (room) {
    id = room.id
    return (`<tourna-ment></tourna-ment>`);
}

// Function to delay execution
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function renderLoop(id, container) {
    const resp = await updateData(id);
    
    // Check if state has changed
    const auth = await getAuth();
    console.log("Auth is", auth);
    const username = auth.username;
    if (resp.state !== state) {
        state = resp.state;
        if (resp.state === "ongoing") {
            renderActiveTournament(id, username, container);
        } else if (resp.state === "registering") {
            renderWaiting(id, username, container);
        } else {
            renderTournamentOver(id, username);
        }
    } 
    else {
        // Update dynamic content only without re-rendering the entire DOM
        if (resp.state === "registering") {
            await fetchPlayers(id);
            updateProgressBar();
        }
        else if(resp.state === "ongoing")
            await updateRenderActive(id);
    }
}


async function updateData(id) {
    const conf = await getTournament(id); // Fetch tournament configuration
    maxPlayers = conf.size; // Maximum number of players
    registered = conf.n_registered; // Number of currently registered
    return conf;       
}

async function renderWaiting(id, username, container) {
    container.innerHTML = /* html */`
    <div class="container mt-5">
        <h1 class="text-center">Waiting Room for Tournament ID : ${id}</h1>
        <h2 class="text-center">You are : ${username}</h1>
        <div class="progress">
            <div id="progress-bar" class="progress-bar progress-bar-striped progress-bar-animated" 
            role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
            </div>
        </div>
        <div id="player-list" class="my-4">
            <!-- Player list will be dynamically inserted here -->
        </div>
    </div>
    `;
    await fetchPlayers(id);
    updateProgressBar();
}

async function fetchPlayers(id) {
    try {
        const players = await getPlayerListTournament(id);
        console.log(players)
        if (!players) {
            console.log("empty tournament player list");
            return;
        }
        updatePlayerList(players);
    } catch (error) {
        console.error('Error fetching players:', error);
    }
}

function updatePlayerList(players) {
    const playerListDiv = document.getElementById('player-list');
    playerListDiv.innerHTML = ''; // Clear the existing list
    players.forEach(player => {
        const alias = player.userid.alias; 
        const playerItem = document.createElement('div');
        playerItem.className = 'alert alert-info';
        playerItem.textContent = alias;
        playerListDiv.appendChild(playerItem);
    });
}

function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = (registered / maxPlayers) * 100;
    progressBar.style.width = progressPercentage + '%';
    progressBar.setAttribute('aria-valuenow', registered);
    if (registered >= maxPlayers) {
        progressBar.classList.remove('progress-bar-striped', 'progress-bar-animated');
        progressBar.classList.add('bg-success');
    }
}

async function renderActiveTournament(id, username, container) {
    console.log("Tournament is starting");
    const match = await getMatchesListTournament(id);
    
    container.innerHTML = "";
    container.innerHTML = /* html */`
    <div id="status-banner" class="mt-4"></div>
    <div class="container mt-5">
        <h1 class="text-center">Playing Tournament ID : ${id}</h1>
        <h2 class="text-center">You are : ${username}</h1>
    </div>
    `;

    //sort rounds by order and match inside
    const rounds = roundDispatch(match);
    //create rounds div
    // Create a container for rounds
    const roundsContainer = document.createElement('div');
    roundsContainer.className =  'tournament-bracket-container d-flex justify-content-center';
    container.appendChild(roundsContainer);
    
    // creates match divs inside
    rounds.forEach((matches, roundIndex) =>{
        const roundDiv = document.createElement('div');
        roundDiv.className = 'round';
        roundDiv.innerHTML = `<h3>Round ${roundIndex + 1}</h3>`;
        roundsContainer.appendChild(roundDiv);

        //once in the round, dispatch the match and its info
        matches.forEach((match, matchIndex) =>{
            const matchDiv = document.createElement('div');
            matchDiv.className = 'match';
            matchDiv.setAttribute("id",`round-${roundIndex + 1}-match-${matchIndex}`);
            matchDiv.innerHTML = /* html */`
                <div class="match-details">
                    <div class="player">${match.player1 ? match.player1.alias : 'TBD'}</div>
                    <div class="vs">VS</div>
                    <div class="player">${match.player2 ? match.player2.alias : 'TBD'}</div>
                    <div class="score"> Score : ${match.score_p1} - ${match.score_p2} </div>
                    <div class="status"> Status : ${match.state}</div>
                </div>
            `;
            roundDiv.appendChild(matchDiv);

        });
    });
    await bannerLogic(id);
}


async function updateRenderActive(id){
    const match = await getMatchesListTournament(id);
    let round = 1;
    let matchIndex = 0;
    match.forEach((match)=>{
        if (match.round !== round){
            round = match.round;
            matchIndex = 0;
        }
        console.log(`*** SEARCHING FOR : round-${match.round}-match-${matchIndex}`);
        let matchDiv = document.getElementById(`round-${match.round}-match-${matchIndex}`);
        console.log("*** matchDiv found is ", matchDiv);
        matchDiv.innerHTML= /* html */`
        <div class="match-details">
            <div class="player">${match.player1 ? match.player1.alias : 'TBD'}</div>
            <div class="vs">VS</div>
            <div class="player">${match.player2 ? match.player2.alias : 'TBD'}</div>
            <div class="score"> Score : ${match.score_p1} - ${match.score_p2} </div>
            <div class="status"> Status : ${match.state}</div>
        </div>`;
        matchIndex++;
    });
    await bannerLogic(id);

}

async function renderTournamentOver(id,username) {
    console.log("tournament is over");
    renderActiveTournament(id, username);
    updateRenderActive(id);
    const data = await getTournament(id);
    console.log("end of toournament data are", data);
    displayBanner(data, id, container);
}

function roundDispatch(match){
    
    let round = {}; //creating a round object to store mathes by round
    console.log("in round dispatch matches are", match);
    match.forEach(m => {
        // Initialize the round key as an array if it doesn't exist
        if (!round[m.round])
            round[m.round] = []; // Initialize as an empty array
        round[m.round].push(m);
    });

    //now we need to create an array of collection, where each collection is a round
    //and each round contains a list of match object
    const sorted = Object.keys(round)
        .sort((a, b) => (a - b))
        .map(n => round[n]);

    return sorted;
}


window.addEventListener("popstate",() => {
    history.pushState(null,"","");
    router();
});


async function bannerLogic(id, container)
{
    const data = await getPlayerTournnamentActive(id);
    if (data.status !== bannerState)
    {
        bannerState = data.status;
        displayBanner(data, id, container);
    }
}

function displayBanner(data, id, container) {

    const bannerDiv = document.getElementById('status-banner');
    
    if (data.state && data.state === "finished"){
        const bannerEnd = document.createElement("div");
        bannerEnd.className = 'alert alert-secondary text-center';
        bannerEnd.setAttribute("role","alert");
        bannerEnd.innerHTML =  /* html */`
                Tournament is Over : Winner is ${data.winner.alias}!
        `;
        container.appendChild(bannerEnd);
    }

    if (data.status === 'match_to_play') {
        bannerDiv.innerHTML =  /* html */`
            <div class="alert alert-info text-center" role="alert">
                You have a match to play against ${data.opponent}!
                <button class="btn btn-primary ml-2" id="startGameButton">Play</button>
            </div>
        `;
        let gameButton = document.getElementById("startGameButton");
        gameButton.addEventListener("click",async ()=>{
            //const resp = await putMatchTest(data.match_id); //*********************** FOR TEST ONLy ********/
            //console.log("result is : ", resp); //to test only
            history.pushState(null,"",`/game/${data.match_id}-${id}`);
            router();
        })
    } else if (data.status === 'eliminated') {
        bannerDiv.innerHTML =  /* html */`
            <div class="alert alert-danger text-center" role="alert">
                You are eliminated from the tournament.
            </div>
        `;
    } else if (data.status === 'waiting_for_next_match') {
        bannerDiv.innerHTML =  /* html */`
            <div class="alert alert-warning text-center" role="alert">
                Waiting for your next match...
            </div>
        `;
    } else if (data.status === 'not_registered') {
        bannerDiv.innerHTML =  /* html */`
            <div class="alert alert-secondary text-center" role="alert">
                You are not registered for this tournament. Read-only :)
            </div>
        `;
    }
}

