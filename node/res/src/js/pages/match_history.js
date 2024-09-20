
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
								<h2 class="krona-font fs-1">24</h2>
								<p>Games played</p>
							</span>
							<span class="col d-flex flex-column align-items-center">
								<h2 class="krona-font fs-1">16</h2>
								<p>Wins</p>
							</span>
							<span class="col d-flex flex-column align-items-center">
								<h2 class="krona-font fs-1">8</h2>
								<p>Defeats</p>
							</span>
						</div>
					</section>
					<section class="d-flex flex-column gap-3">
						<div class="w-100 match-card match-card-defeat">
							<div class="d-flex justify-content-between">
								<p class="match-card-type mb-0">Regular</p>
								<p class="match-card-type mb-0">Defeat</p>
							</div>
							<div class="d-flex justify-content-center gap-5 align-items-center">
								<div class="d-flex align-items-center gap-3">
									<div class="match-card-pic"></div>
									<p class="mb-0">Player 1</p>
								</div>
								<p class="match-card-score krona-font fs-2 mb-0">1 - 3</p>
								<div class="d-flex align-items-center gap-3">
									<p class="mb-0">Player 2</p>
									<div class="match-card-pic"></div>
								</div>
							</div>
							<div class="d-flex justify-content-end gap-3 mb-0">
								<p class="mb-0">1 day ago</p>
							</div>
						</div>
						<div class="w-100 match-card match-card-win">
							<div class="d-flex justify-content-between">
								<p class="match-card-type mb-0">Regular</p>
								<p class="match-card-type mb-0">Victory</p>
							</div>
							<div class="d-flex justify-content-center gap-5 align-items-center">
								<div class="d-flex align-items-center gap-3">
									<div class="match-card-pic"></div>
									<p class="mb-0">Player 1</p>
								</div>
								<p class="match-card-score krona-font fs-2 mb-0">3 - 2</p>
								<div class="d-flex align-items-center gap-3">
									<p class="mb-0">Player 2</p>
									<div class="match-card-pic"></div>
								</div>
							</div>
							<div class="d-flex justify-content-end gap-3 mb-0">
								<p class="mb-0">2 days ago</p>
							</div>
						</div>
					</section>
				</div>
			</main>
		`;
	}
	connectedCallback() {
	

	};
}

customElements.define('match-history', MatchHistory);

export default  function matchHistory () {
	return ('<match-history></match-history>');
}
