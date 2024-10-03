import gameai from './pages/gameAI.js';
import waitroom from './pages/waitroom.js';
import renderGame from './pages/gameRem.js'
import tournamentRoom from './tournament/tournamentRoom.js';
import tournament from './tournament/tournament.js';
import home from './pages/home.js';
import profile from './pages/profile.js';
import friends from './pages/friends.js';
import loading from './pages/loading.js';
import signup from './pages/signup.js';
import matchHistory from './pages/match_history.js';
import { is_authenticated, getCookie } from './user_login.js';
import renderLobby from './pages/renderLobby.js';
//import about from './pages/about.js';
//import settings from './pages/settings.js';

'use strict';

const routes = {
	'/': { title: 'Home', render: home, auth: true},
	'/profile': { title: 'Profile', render: profile, auth: true},
	'/friends': { title: 'Friends', render: friends, auth: true},
	'/signup': { title: 'Signup', render: signup, auth: false},
	'/gamebot': { title: 'You will lose', render: gameai, auth: true},
	'/gamebot/:id': { title: 'You will lose', render: gameai, auth: true},
	'/waitroom': { title: 'HAVE FUN', render: waitroom, auth: true},
	'/waitroom/create': { title: 'HAVE FUN', render: waitroom, auth: true},
	'/waitroom/join': { title: 'HAVE FUN', render: waitroom, auth: true},
	'/game/:id': { title: "Game", render: renderGame, auth: true},
	'/tournament': { title: "Game", render: tournamentRoom, auth: true},
	'/tournament/create': { title: "Game", render: tournamentRoom, auth: true},
	'/tournament/join': { title: "Game", render: tournamentRoom, auth: true},
	'/tournament/join': { title: "Game", render: tournamentRoom, auth: true},
	'/match-history': { title: 'Match History', render: matchHistory, auth: true},
	"/tournament/:id": { title: "Game", render: tournament, auth: true},
	"/lobby/:id": { title: "Lobby", render: renderLobby, auth: true},
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
		e.preventDefault();
		history.pushState('', '', e.target.href);
		router();
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

function routeSearch(path){
    let route = null;
    let param = null;

    console.log("path in route Search is : ", path);
    for (const key in routes) {
        if (key === path){
            route = routes[key];
            console.log("route is perfect match : ", route);
            return {route, param};
        }
        if (key.includes(":id")){
            const staticpart = key.split(":id")[0];
            if (path.startsWith(staticpart)){
                const id = path.slice(staticpart.length);
                if (id) {
                    param = { id };
                }
                route = routes[key];
                console.log("route is match with route and id : ", route.title, id);
                return {route, param};
            }
        }
    }
    console.log("route is not found");
    return {route, param};
}

/* Renders page as SPA using location.pathname */
export async function	router() {
	app.innerHTML = loading();
	setTimeout(async () => {
		const isAuth =  await is_authenticated(getCookie('token'));
		const windowPathname = window.location.pathname;
		const {route, param} = routeSearch(windowPathname);
		//updateActiveElementNavbar();
		if (route) {
			if (isAuth === route.auth) {
				document.title = route.title;
				console.log(param);
				if (param)
					app.innerHTML = route.render(param);
				else
					app.innerHTML = route.render();
			}
			else if (isAuth  && !view.auth) {
				history.pushState('', '', '/');
				app.innerHTML = '<home-authorized></home-authorized>';
			}
			else {
				history.pushState('', '', '/');
				app.innerHTML = '<home-out></home-out>';
			}
			
		} else {
			history.replaceState('', '', '/');
			router();
		}
	}, 250);
	
};

