import home from './pages/home.js';
import profile from './pages/profile.js';
import { is_authenticated, getCookie } from './login';
//import about from './pages/about.js';
//import settings from './pages/settings.js';

'use strict';

const routes = {
	'/': { title: 'Home', render: home},
	'/profile': { title: 'Profile', render: profile},
};

/* Select main container where different pages will render */
//const	mainContainer = document.querySelector('#app');

/* Update router when content is fully loaded and user navigates session history */
window.addEventListener('popstate', router);
window.addEventListener('DOMContentLoaded', () => {
	router();
});

/* Handle navigation */
window.addEventListener('click', e => {
	if (e.target.matches('[data-link]')) {
		const	oldCssRoute = routes[window.location.pathname].css;
		e.preventDefault();
		history.pushState('', '', e.target.href);
		router(oldCssRoute);
	}
});

/* Removes all 'active' classes from nav elements and adds it to the current page element */
function	updateActiveElementNavbar() {
	const	windowPathname = window.location.pathname;
	const	navLinks = document.querySelectorAll('.nav-link');

	navLinks.forEach(navElement => {
		const	elementPathname = new URL(navElement.href).pathname;

		navElement.classList.remove('active');
		if (elementPathname === windowPathname) {
			navElement.classList.add('active');
		}
	});
}

/* Renders page as SPA using location.pathname */
export async function	router() {
	const isAuth =  await is_authenticated(getCookie("token"));
	const	windowPathname = window.location.pathname;
	let view = routes[windowPathname];
	console.log(app)
	//updateActiveElementNavbar();
	if (view) {
		if (isAuth) {
			document.title = view.title;
			app.innerHTML = view.render();
		}
		else {
			app.innerHTML = '<home-out></home-out>';
		}
		
	} else {
		history.replaceState('', '', '/');
		router();
	}
};


