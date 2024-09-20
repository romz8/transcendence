
export function displayCountdown(number) {
    const countdownElement = document.getElementById('countdown');
    countdownElement.textContent = number;
}

export function updateScores(data) {
    document.getElementById('player1-score').textContent = `Score: ${data.score.player1}`;
    document.getElementById('player2-score').textContent = `Score: ${data.score.player2}`;
}

export function displayForfeitMessage(message) {
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = /* html */`
        <div class="card text-white bg-danger mb-3" style="max-width: 18rem;">
            <div class="card-header">Game Over</div>
            <div class="card-body">
                <h5 class="card-title">Player Forfeit</h5>
                <p class="card-text">${message}</p>
                <p class="card-text">player lost the game by forfeit.</p>
            </div>
        </div>
    `;
}

  // Function to display the leaving message
export function displayLeave(message) {
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = /* html */`
        <div class="card text-white bg-danger mb-3" style="max-width: 18rem;">
            <div class="card-header">Leaving Waiting Room</div>
            <div class="card-body">
                <h5 class="card-title">You left the Room</h5>
                <p class="card-text">${message}</p>
            </div>
        </div>
    `;
}

export function displayOverMessage(data) {
    console.log("in Over Message");
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = /* html */`
        <div class="card text-white bg-danger mb-3" style="max-width: 18rem;">
            <div class="card-header">Game Over </div>
            <div class="card-body">
                <h5 class="card-title">Party is over !</h5>
                <p class="card-text">The winner is ${data.winner}</p>
                <p class="card-text">The score is ${data.score.player1} - ${data.score.player2}</p>
                <p class="card-text">${data.message}</p>
            </div>
        </div>
    `;
}