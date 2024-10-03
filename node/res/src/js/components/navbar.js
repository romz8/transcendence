import { router } from '../routes';
import { updateLightMode } from '../main';
import { createToast } from './toast';
import { generateLangs } from '../languages';
import { disconnectWB } from '../user_login';

class NavBar extends HTMLElement {
	constructor() {
		super();
		
		let	optionalElements = '';
		if (this.hasAttribute('data-authorized')) {
			optionalElements = /* html */`
			<li><a href="/tournament" class="nav-link" data-link>Tournament</a></li>
			<li><a href="/waitroom" class="nav-link" data-link>Play Remote</a></li>
			<li><a href="/gamebot" id="play-btn" class="nav-link" data-link>Play Local</a></li>
			<li class="nav-item dropdown">
				<a id="profile-btn" class="nav-link dropdown-toggle" href="" role="button" data-bs-toggle="dropdown" aria-expanded="false">Profile</a>
				<ul class="dropdown-menu dropdown-menu-end">
					<li><a class="dropdown-item" href="/profile" data-link><i class="fa-regular fa-user fa-lg me-2"></i><span id="settings-text">Settings</span></a></li>
					<li><a class="dropdown-item" href="/friends" data-link><i class="fa-regular fa-face-laugh-wink fa-lg me-2"></i><span id="friends-text">Friends</span></a></li>
					<li><a class="dropdown-item" href="/match-history" data-link><i class="fa-regular fa-chart-bar fa-lg me-2"></i><span id="match-history-text">Match history</span></a></li>
					<li><a id="logout-btn" class="dropdown-item" href="" data-link><i class="fa-solid fa-arrow-right-from-bracket fa-lg me-2"></i><span id="logout-text">Log out</span></a></li>
				</ul>
			</li>
			`;
		}
		this.innerHTML = /* html */`
			<header class="topnav wraper d-flex justify-content-between">
			<h1 class="navbar-brand d-flex align-items-center"><a href="/" id="home-icon" data-link>Transcendence</a></h1>
				<nav>
					<div class="div topnav__menu">
						<button class="topnav__burger" type="button" data-bs-toggle="collapse" data-bs-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
							<div class="bar"></div>
							<div class="bar"></div>
							<div class="bar"></div>
						</button>
						<div class="topnav__list topnav__menu__hidden">
							<ul class="topnav__links d-flex align-items-center gap-4">
								${optionalElements}
								<li class="nav-item dropdown">
									<a id="language-btn" class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
										Language
									</a>
									<ul class="dropdown-menu dropdown-menu-end">
										<li class="language-select" value="ca"><a id="ca-btn" class="dropdown-item" href="#">Catalan</a></li>
										<li class="language-select" value="es"><a id="es-btn" class="dropdown-item" href="#">Spanish</a></li>
										<li class="language-select" value="en"><a id="en-btn" class="dropdown-item" href="#">English</a></li>
										<li class="language-select" value="fr"><a id="fr-btn" class="dropdown-item" href="#">French</a></li>
									</ul>
								</li>
								<li class="d-flex align-items-center">
									<svg id="dark-icon" class="light-mode-switch visible_cs light-icon-trans" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 7.43973C13.7291 7.43973 11.5526 8.34272 9.94758 9.94764C8.34263 11.5526 7.43968 13.729 7.43968 16.0001C7.43968 18.2711 8.34267 20.4474 9.94758 22.0525C11.5525 23.6574 13.729 24.5604 16 24.5604C18.271 24.5604 20.4473 23.6574 22.0524 22.0525C23.6574 20.4475 24.5603 18.2711 24.5603 16.0001C24.5558 13.7306 23.6528 11.5558 22.0479 9.95224C20.4444 8.34729 18.2694 7.44426 16 7.43973ZM16 22.4003C14.3336 22.3793 12.7421 21.6998 11.5738 20.5118C10.4053 19.3224 9.75432 17.7204 9.76031 16.0541C9.76781 14.3877 10.4338 12.7902 11.6112 11.6114C12.7902 10.4339 14.3877 9.76793 16.054 9.76044C17.7204 9.75444 19.3224 10.4054 20.5117 11.5739C21.6997 12.7424 22.3791 14.3338 22.4001 16.0001C22.4001 17.6981 21.7252 19.3255 20.5252 20.5254C19.3253 21.7253 17.6979 22.4003 16 22.4003ZM17.1205 27.6636V30.8795C17.1205 31.4975 16.618 32 16 32C15.382 32 14.8795 31.4975 14.8795 30.8795V27.5841C14.8795 26.9646 15.382 26.4637 16 26.4637C16.618 26.4637 17.1205 26.9646 17.1205 27.5841V27.6636ZM8.60823 23.3918C9.04771 23.8342 9.04771 24.5482 8.60823 24.9922L6.27282 27.3112C6.06133 27.5272 5.77333 27.6471 5.47186 27.6471C5.17637 27.6471 4.89288 27.5257 4.68887 27.3112C4.46988 27.1027 4.34538 26.8147 4.34538 26.5117C4.34538 26.2087 4.46988 25.9207 4.68887 25.7122L7.02428 23.3603C7.47428 22.9403 8.17625 22.9538 8.60823 23.3918ZM4.41586 17.1205H1.12048C0.502486 17.1205 0 16.618 0 16C0 15.382 0.502486 14.8795 1.12048 14.8795H4.41586C5.03534 14.8795 5.53633 15.382 5.53633 16C5.53633 16.618 5.03534 17.1205 4.41586 17.1205ZM4.68735 6.27279H4.68885C4.24638 5.83032 4.24638 5.11484 4.68885 4.67233C5.12982 4.22986 5.8468 4.22986 6.28781 4.67233L8.60825 7.02426C9.04772 7.46673 9.04772 8.18071 8.60825 8.62472C8.39075 8.82721 8.10576 8.94121 7.80879 8.94421C7.5148 8.94271 7.2343 8.82721 7.0243 8.62472L4.68735 6.27279ZM14.8795 4.41586V1.12048C14.8795 0.502487 15.382 0 16 0C16.618 0 17.1205 0.502487 17.1205 1.12048V4.41586C17.1205 5.03535 16.618 5.53634 16 5.53634C15.382 5.53634 14.8795 5.03535 14.8795 4.41586ZM23.3918 8.60825C22.9523 8.16578 22.9523 7.45179 23.3918 7.00778L25.7272 4.67237C26.1696 4.2299 26.8851 4.2299 27.3276 4.67237C27.7701 5.11484 27.7701 5.83032 27.3276 6.27283L24.9757 8.60825C24.7657 8.81224 24.4852 8.92624 24.1912 8.92774C23.8942 8.92624 23.6093 8.81224 23.3918 8.60825ZM32 16C32 16.618 31.4975 17.1205 30.8795 17.1205H27.5841C26.9647 17.1205 26.4637 16.618 26.4637 16C26.4637 15.382 26.9647 14.8795 27.5841 14.8795H30.8795C31.1765 14.8795 31.4615 14.998 31.6715 15.208C31.8815 15.418 32 15.703 32 16ZM27.3127 25.7272H27.3112C27.7506 26.1712 27.7506 26.8852 27.3112 27.3277C27.1087 27.5437 26.8237 27.6652 26.5282 27.6637C26.2267 27.6637 25.9387 27.5422 25.7272 27.3277L23.3918 24.9923C22.9493 24.5498 22.9493 23.8343 23.3918 23.3918C23.8343 22.9493 24.5498 22.9493 24.9923 23.3918L27.3127 25.7272Z"/></svg>
									<svg id="light-icon" class="light-mode-switch invisible_cs light-icon-trans" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.65 29.0342C22.5679 29.0342 26.3024 27.3348 28.8963 24.3717C29.156 24.0749 29.2291 23.6567 29.0856 23.2885C28.9421 22.9204 28.6061 22.6637 28.2148 22.6233C20.9663 21.8777 15.5 15.7814 15.5 8.44224C15.5 6.72061 15.8042 5.03312 16.4041 3.4273C16.5423 3.05735 16.4636 2.64093 16.2 2.34772C15.9368 2.05485 15.5325 1.93447 15.1524 2.03479C9.17515 3.62442 5 9.08183 5 15.3062C5 22.876 11.1233 29.0342 18.65 29.0342ZM13.8169 4.75328C13.5397 5.95818 13.4 7.19229 13.4 8.44224C13.4 16.1349 18.6314 22.6384 25.8757 24.3639C23.8394 26.007 21.2939 26.9222 18.65 26.9222C12.2814 26.9222 7.1 21.7112 7.1 15.3062C7.1 10.7172 9.78135 6.62135 13.8169 4.75328Z" fill="#171716"/></svg>
								</li>
							</ul>
						</div>
					</div>
				</nav>
			</header>
		`;
		/*
			On navbar creation it checks that light-mode icons match the color-scheme selected,
			they could be reversed due to navbar not being loaded into DOM when color-scheme is set
		*/
		function	setColorModeIcon() {
			const	lightIcon = document.getElementById('light-icon');
			const	darkIcon = document.getElementById('dark-icon');
			
			if (document.documentElement.hasAttribute('data-bs-theme') || (!document.documentElement.hasAttribute('data-bs-theme') && darkIcon.classList.contains('invisible_cs'))) {
				lightIcon.classList.toggle('invisible_cs');
				lightIcon.classList.toggle('visible_cs');
				darkIcon.classList.toggle('invisible_cs');
				darkIcon.classList.toggle('visible_cs');
			}
		}
		setColorModeIcon();
	}
	connectedCallback() {
		generateLangs()
		const	burgerButton = document.querySelector('.topnav__burger');
		const	topnavMenu = document.querySelector('.topnav__menu');
		const	topnavList = document.querySelector('.topnav__list');
		const	menuBars = document.querySelectorAll('.topnav__burger .bar');

		/*
			Burger menu controls, toggle menu expanded classes and icon animation
		*/
		burgerButton.addEventListener('click', () => {
			topnavMenu.classList.toggle('topnav__menu__expanded');
			topnavList.classList.toggle('topnav__menu__hidden');
			// Burger menu animation
			menuBars[0]?.classList.toggle('bar-close-1');
			menuBars[1]?.classList.toggle('bar-close-2');
			menuBars[2]?.classList.toggle('bar-close-3');
		});

		/*
			Check if window is > 992px when resizing to update navbar state to Desktop
		*/
		window.addEventListener('resize', () => {
			if (window.innerWidth > 992) {
				topnavList.classList.add('topnav__menu__hidden');
				topnavMenu.classList.remove('topnav__menu__expanded');
				// Burger menu animation
				menuBars[0]?.classList.remove('bar-close-1');
				menuBars[1]?.classList.remove('bar-close-2');
				menuBars[2]?.classList.remove('bar-close-3');
			}
		});

		/*
			Controls light mode switch behaviour
		*/
		const	lightModeSwitch = document.querySelectorAll('.light-mode-switch');
		lightModeSwitch.forEach( elementSwitch => {
			elementSwitch.addEventListener('click', () => {
				if (document.documentElement.hasAttribute('data-bs-theme'))
					updateLightMode('dark');
				else
					updateLightMode('light');
			});
		});

		/* If user is logged in, add event listener for optional elements of nav-bar*/
		if (this.hasAttribute('data-authorized')) {
			const	logoutBtn = document.getElementById('logout-btn');
			if (logoutBtn) {
				logoutBtn.addEventListener('click', () => {
					createToast('successful','Hope to see you back soon!');
					document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict";
					document.cookie = "refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict";
				disconnectWB()
					localStorage.removeItem('username');
					localStorage.removeItem('alias');
					localStorage.removeItem('name');
					localStorage.removeItem('lastname');
					localStorage.removeItem('campus');
					localStorage.removeItem('img');
					router();
				});
			}
		}
	}
}

customElements.define('nav-bar', NavBar);
