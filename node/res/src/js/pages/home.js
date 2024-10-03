import Lottie from 'lottie-web';
import { callApi42, is_authenticated, getCookie, expiresDate, conectWB } from '../user_login';
import i18next from 'i18next';
import { router } from '../routes';
import { createToast } from '../components/toast';
import { updateUserInfo } from '../main';
import { generateLangs } from '../languages';

class HomeOut extends HTMLElement {
	constructor() {
		super();
		this.innerHTML = /* html */`
			<nav-bar></nav-bar>
			<main class="container">
				<form id="form-login" class="col-sm-12 col-md-8 col-lg-6 mt-5 login-form">
					<div class="mb-3">
						<div id="paddle-animation"></div>
					</div>
					<div class="mb-3">
						<label for="input-username" class="form-label">Username</label>
						<input type="text" class="form-control" id="input-username" name="username" aria-describedby="usernameHelp" placeholder="Enter your username" minlength="1" maxlength="16" required>
					</div>
					<div class="mb-3">
						<label for="input-pass" class="form-label">Password</label>
						<input type="password" class="form-control" id="input-pass" name="password" placeholder="Password" minlength="1" maxlength="16" required>
					</div>
					<button id="login-username-btn" type="submit" class="btn btn-outline-cream-fill btn-general w-100 mb-3">Log in</button>
					<button id="login-42-btn" type="button" class="btn btn-outline-cream w-100 btn-general d-flex align-items-center justify-content-center gap-3 mb-3">
						<svg class="cs-svg" height="34" viewBox="0 0 30 35" xmlns="http://www.w3.org/2000/svg"><path d="M1 22.1962H11.3156V28.0542H16.4625V17.4681H6.16563L16.4625 5.77354H11.3156L1 17.4681V22.1962Z"/><path d="M18.6843 11.6279L23.8343 5.77354H18.6843V11.6279Z"/><path d="M23.8343 11.6279L18.6843 17.4681V23.3048H23.8343V17.4681L29 11.6279V5.77354H23.8343V11.6279Z"/><path d="M29 17.4681L23.8344 23.3048H29V17.4681Z"/></svg>
						<span id="login-42-txt">Log in with 42</span>
					</button>
					<p class="d-block text-center">Don't have an account? <a data-link id="signup-txt" class="link-cream link-offset-2 link-underline-opacity-25 link-underline-opacity-75-hover" href="/signup">Sign up here</a></p>
				</form>
   			 </main>
		`;
	}
	connectedCallback() {
		generateLangs('home-out');
		Lottie.loadAnimation({
			container: document.getElementById('paddle-animation'),
			renderer: 'svg',
			loop: true,
			autoplay: true,
			path: '/src/assets/paddle_lottie.json'
		});

		const	login42Btn = document.getElementById('login-42-btn');
		login42Btn.addEventListener('click', () => {
			callApi42();
		});

		const formLogin = document.getElementById('form-login');
		const loginusernameBtn = document.getElementById('login-username-btn');
		loginusernameBtn.addEventListener('click', async (e) => {
			e.preventDefault();
			const formData = new FormData(formLogin);
			try {
				const response = await fetch('http://localhost:8080/loginWeb/', {
					method: 'POST',
					body: formData,
				});
				const tokens = await response.json();
				conectWB(tokens['access']);
				if (!response.ok) {
					throw (`${tokens.error}`);
				}
				document.cookie = `token=${tokens['access']}; expires=${expiresDate(tokens['token_exp']).toUTCString()}; Secure; SameSite=Strict`;
				document.cookie = `refresh=${tokens['refresh']}; expires=${expiresDate(tokens['refresh_exp']).toUTCString()}; Secure; SameSite=Strict`;
				createToast('successful','Logged in successfully');
				router();
			  } catch (e) {
				createToast('warning', `Error: ${e}`);
			  }
		});

		/* document.getElementById('login-42-txt').textContent = i18next.t('login_42_txt');
		document.getElementById('login-email-txt').textContent = i18next.t('login_email_txt');
		document.getElementById('signup-txt').textContent = i18next.t('signup_txt'); */
	}
}

class HomeAuthorized extends HTMLElement {
	constructor() {
		super();
	}
	async connectedCallback() {
		await updateUserInfo();
		this.innerHTML = /* html */`
				<style>
					.div-test {
						height: 100vh;
					}
					h1 {
						color: var(--bs-cs-secondary);
						font-size: 100px;
					}
					.profile-link {
						width: 200px;
						height: 200px;
						border: 1px solid var(--bs-cs-secondary);
						border-radius: 250px;
						background-image: url(${localStorage.getItem('img')});
						background-position: center; 
						background-repeat: no-repeat; 
						background-size: cover; 
					}
				</style>
				<nav-bar data-authorized></nav-bar>
				<div class="div-test d-flex align-items-center justify-content-center">
					<h1>Hi, ${localStorage.getItem('alias')};</h1>
					<h2>Hi, ${localStorage.getItem('username')}</h2>
					<div class="profile-link"></div>
			`;
	}
}

customElements.define('home-out', HomeOut);
customElements.define('home-authorized', HomeAuthorized);

export default function home () {
	return ('<home-authorized></home-authorized>');
}
