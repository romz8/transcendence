import home from './pages/home.js';
import profile from './pages/profile.js';
import login from './pages/login.js';
import singup from './pages/singup.js';
import gameai from './pages/gameAI.js';
import waitroom from './pages/waitroom.js';
import { is_authenticated, getCookie } from './login';
import renderGame from './pages/gameRem.js'
//import about from './pages/about.js';
//import settings from './pages/settings.js';

'use strict';

const routes = {
	'/': { title: 'Home', render: home},
	'/profile': { title: 'Profile', render: profile},
	'/login': { title: 'Login', render: login},
	'/signup': { title: 'Signup', render: singup},
	'/gamebot': { title: 'You will lose', render: gameai},
	'/waitroom': { title: 'HAVE FUN', render: waitroom},
	'/waitroom/create': { title: 'HAVE FUN', render: waitroom},
	'/waitroom/join': { title: 'HAVE FUN', render: waitroom},
	'/game/:id': { title: "Game", render: renderGame },
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
                if (id){
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
	const isAuth =  await is_authenticated(getCookie("token"));
	const	windowPathname = window.location.pathname;
	const {route, param} = routeSearch(windowPathname);

	//updateActiveElementNavbar();
	if (route) {
		if (isAuth) {
			document.title = route.title;
			console.log(param)
			if (param)
				app.innerHTML = route.render(param);
			else
				app.innerHTML = route.render();
		}
		else {
			if (route.title == "Login")
				app.innerHTML = route.render();
			else if (route.title == "Signup")
				app.innerHTML = route.render();
			else
				app.innerHTML = '<home-out></home-out>';
		}
		
	} else {
		history.replaceState('', '', '/');
		router();
	}
};


