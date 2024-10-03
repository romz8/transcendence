
class Loading extends HTMLElement {
	constructor() {
		super();
		this.innerHTML = /* html */`
			<style>
			.load-container {
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: var(--bs-cs-primary); /* Full-screen background color */
        }

        .loader {
            display: flex;
            gap: 15px; /* Space between the dots */
        }

        .loader div {
            width: 20px;
            height: 20px;
            background-color: var(--bs-cs-secondary);
            border-radius: 50%;
            animation: bounce 1.2s infinite ease-in-out;
        }

        .loader div:nth-child(1) {
            animation-delay: -0.24s;
        }
        .loader div:nth-child(2) {
            animation-delay: -0.12s;
        }
        .loader div:nth-child(3) {
            animation-delay: 0;
        }
        .loader div:nth-child(4) {
            animation-delay: 0.12s;
        }

        @keyframes bounce {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.5);
            }
        }
			</style>
			<div class="load-container">
				<div class="loader">
					<div></div>
					<div></div>
					<div></div>
				<div></div>
			</div>
		`;
	}
	connectedCallback() {
	};
}

customElements.define('load-ing', Loading);

export default  function loading () {
	return ('<load-ing></load-ing>');
}
