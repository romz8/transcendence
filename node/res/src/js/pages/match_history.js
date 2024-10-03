import { getCookie } from "../user_login";

class MatchHistory extends HTMLElement {
	constructor() {
		super();
		this.innerHTML = /* html */`
			<nav-bar data-authorized></nav-bar>
			<main class="container">
				<div class="col-sm-12 col-md-9 col-lg-6 mx-auto">
					<div class="mb-5 row">
						<h1 class="text-center">Match history</h1>
						<p class="text-center">View your last games and stats.</p>
					</div>
					<section class="mb-5">
						<div class="row justify-content-between">
							<span class="col d-flex flex-column align-items-center">
								<h2 id="game-counter" class="krona-font fs-1">24</h2>
								<p>Games played</p>
							</span>
							<span class="col d-flex flex-column align-items-center">
								<h2 id="wins-counter" class="krona-font fs-1">16</h2>
								<p>Wins</p>
							</span>
							<span class="col d-flex flex-column align-items-center">
								<h2 id="losses-counter" class="krona-font fs-1">8</h2>
								<p>Defeats</p>
							</span>
						</div>
					</section>
					<section id='matches-container' class="d-flex flex-column gap-3">
					</section>
				</div>
			</main>
		`;
	}
	connectedCallback() {
		fetch('http://localhost:8000/game/allmatch/', {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + getCookie('token'),
				'Content-Type': 'application/json'
			},
		})
		.then(response => {
			if (!response.ok)
				throw new Error('Network response was not ok ' + response.statusText);
			return response.json();
		})
		.then(data => {
			console.log(data);

			const matchesContainer = document.getElementById('matches-container');
			const totalGames = data.length;
			const totalWins = data.filter(match => match.score_p1 > match.score_p2).length;
			const totalLosses = totalGames - totalWins;

			document.getElementById('game-counter').innerText = totalGames;
			document.getElementById('wins-counter').innerText = totalWins;
			document.getElementById('losses-counter').innerText = totalLosses;

			data.map(match => {
				const matchCard = document.createElement('div');
				const winner = getMatchResult(match.score_p1, match.score_p2);
				if (winner === 'Victory')
					matchCard.classList.add('w-100', 'match-card', 'match-card-win');
				else
					matchCard.classList.add('w-100', 'match-card', 'match-card-defeat');
				matchCard.innerHTML = /* html */`
					<div class="d-flex justify-content-between">
					<p class="match-card-type mb-0">${getMatchType(match.tournament)}</p>
					<p class="match-card-type mb-0">${getMatchResult(match.score_p1, match.score_p2)}</p>
					</div>
					<div class="d-flex justify-content-center gap-5 align-items-center">
					<div class="d-flex align-items-center gap-3">
						<div class="match-card-pic"></div>
						<p class="mb-0">${match.player1.alias}</p>
					</div>
					<p class="match-card-score krona-font fs-2 mb-0">${match.score_p1} - ${match.score_p2}</p>
					<div class="d-flex align-items-center gap-3">
						<p class="mb-0">${match.player2.alias}</p>
						<div class="match-card-pic"></div>
					</div>
					</div>
					<div class="d-flex justify-content-end gap-3 mb-0">
					<p class="mb-0">${timeAgo(match.game_date)}</p>
					</div>
				`;
			
				matchesContainer.appendChild(matchCard);
			});
		})
		.catch(error => {
			console.error('There has been a problem with your fetch operation:', error);
			return false;
		});

	};
}

function timeAgo(date) {
	const now = new Date();
	const gameDate = new Date(date);
	const difference = Math.floor((now - gameDate) / (1000 * 60 * 60 * 24));

	if (difference === 0) return "Today";
	else if (difference === 1) return "1 day ago";
	else return `${difference} days ago`;
}

function getMatchResult(scoreP1, scoreP2) {
	return scoreP1 > scoreP2 ? "Victory" : "Defeat";
}

function getMatchType(tournament){
	return tournament ? "Tournament": "Regular";
}

customElements.define('match-history', MatchHistory);

export default  function matchHistory () {
	return ('<match-history></match-history>');
}
