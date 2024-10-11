import { getCookie } from "../user_login";
import i18next from 'i18next';

class BlockChain extends HTMLElement {
	constructor() {
		super();
		this.innerHTML = /* html */`
			<nav-bar data-authorized></nav-bar>
			<main class="container">
				<div class="col-sm-12 col-md-9 col-lg-6 mx-auto">
					<div class="mb-5 row">
						<h1 class="text-center krona-font" data-translate="text" data-key="blockchain_history">Blockchain history</h1>
						<p class="text-center" data-translate="text" data-key="blockchain_info">View all history registered in the blockchain.</p>
					</div>
					<section id='matches-container' class="d-flex flex-column gap-3">
					</section>
				</div>
			</main>
		`;
	}

	async connectedCallback() {
		fetch('https://localhost:3001/tourapi/blockchain/get_tournament', {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + await getCookie('token'),
				'Content-Type': 'application/json'
			},
		})
		.then(response => {
			if (!response.ok)
				throw new Error('Network response was not ok ' + response.statusText);
			return response.json();
		})
		.then(data => {
			const matchesContainer = document.getElementById('matches-container');
			const block = data["results"];
			block.map(match => {
				const matchCard = document.createElement('div');
			
				// Descomponer el marcador
				const [score_winner, score_runnerup] = match.final_score.split('-').map(Number);

				matchCard.classList.add('w-100', 'match-card');
				// Aquí asumo que tienes una función `getMatchType` que puede obtener el tipo de torneo
				matchCard.innerHTML = /* html */ `
					<div class="d-flex justify-content-between">
						<p class="match-card-type mb-0">${i18next.t('player_count', { count: match.participant_count})}</p>
					</div>
					<div class="d-flex justify-content-center gap-5 align-items-center">
						<div class="d-flex align-items-center gap-3">
							<div class="match-card-pic"></div>
							<p class="mb-0">${extractUsername(match.winner)}</p>
						</div>
						<p class="match-card-score krona-font fs-2 mb-0">${score_winner} - ${score_runnerup}</p>
						<div class="d-flex align-items-center gap-3">
							<p class="mb-0">${extractUsername(match.runner_up)}</p>
							<div class="match-card-pic"></div>
						</div>
					</div>
				`;
			
				matchesContainer.appendChild(matchCard);
			});
			
		})
		.catch(error => {
			return false;
		});

	};
}

function extractUsername(data) {
    const regex = /^user id \d+ aka (.+)$/;

    const match = data.match(regex);

    if (match) {
        return match[1];
    } else {
        return data;
    }
}

function timeAgo(date) {
	const now = new Date();
	const gameDate = new Date(date);
	const difference = Math.floor((now - gameDate) / (1000 * 60 * 60 * 24));

	if (difference === 0) return "Today";
	else if (difference === 1) return "1 day ago";
	else return `${difference} days ago`;
}

customElements.define('block-chain', BlockChain);

export default  function blockchain () {
	return ('<block-chain></block-chain>');
}
