import { router } from './routes';

let uid;

window.onload = fetchUIDENV;

///////////////////////////////////////////// UTILS /////////////////////////////////////////////

async function fetchUIDENV() {
	fetch('http://localhost:8080/uidenv/', {
		method: 'GET',
	})
		.then(response => {
			if (!response.ok)
				throw new Error('Network response was not ok ' + response.statusText);
			return response.json();
		})
		.then(data => {
			uid = data['UID'];
		})
		.catch(error => console.error('There has been a problem with your fetch operation:', error));
}

export function expiresDate(seconds)
{
	const currentDate = new Date();
	currentDate.setSeconds(currentDate.getSeconds() + Number(seconds));
	return currentDate;
}

export function getCookie(cname) {
	let name = cname + '=';
	let ca = document.cookie.split(';');
	for(let i = 0; i < ca.length; i++)
	{
		let c = ca[i];
		while (c.charAt(0) == ' ')
			c = c.substring(1);
		if (c.indexOf(name) == 0)
			return c.substring(name.length, c.length);
	}
	return '';
}

function getPathVars() {
	const querySearch = window.location.search;
	const URLParams = new URLSearchParams(querySearch);
    
	if (URLParams)
	{
		let vars = {};
		vars['code'] = URLParams.get('code');
		vars['state'] = URLParams.get('state');
		return vars;
	}
}

function clearURL() {
	const url = new URL(window.location.href);
	url.search = '';
	window.history.replaceState({}, document.title, url.toString());
}

/////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////// USER STATUS /////////////////////////////////////////////

export var socket = null;

export function conectWB(access_token)
{
    socket = new WebSocket(`ws://localhost:8080/ws/user_status/?token=${access_token}`);
    socket.onopen = function(event) {
        console.log("Conexión WebSocket establecida.");
    };
    
    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log("Mensaje recibido:", data);
    };
    
    socket.onerror = function(error) {
        console.error("Error en WebSocket:", error);
    };
    
    socket.onclose = function(event) {
        console.log("Conexión WebSocket cerrada.");
    };
}

export function disconnectWB() {
    if (socket) {
        socket.close();
        console.log("WebSocket desconectado manualmente.");
        socket = null; // Limpiamos la referencia del socket
    } else {
        console.log("No hay una conexión WebSocket activa.");
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

export async function callApi42(){
	const params = new URLSearchParams ({
		'client_id': uid,
		'redirect_uri': 'http://localhost:3000/',
		'scope': 'public',
		'state': '1234566i754twrqwdfghgfddtrwsewrt',
		'response_type': 'code'
	});
	window.location.href = `https://api.intra.42.fr/oauth/authorize/?${params.toString()}`;
}

///////////////////////////////////// REFRESH TOKEN /////////////////////////////////////

async function getNewAccessToken(infoLogin)
{
	try {
		const response = await fetch('http://localhost:8080/refreshToken/', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(infoLogin)
		});

		if (!response.ok) {
			throw new Error('Network response was not ok ' + response.statusText);
		}
		const data = await response.json();
		console.log(data);
		if (data['access'])
		{
			console.log(data['access_token']);
			document.cookie = `token=${data['access']}; expires=${expiresDate(data['token_exp']).toUTCString()}; Secure; SameSite=Strict`;
			document.cookie = `refresh=${data['refresh']}; expires=${expiresDate(data['refresh_exp']).toUTCString()}; Secure; SameSite=Strict`;
		}
		console.log('Response OK');
	} catch (error) {
		console.error('There has been a problem with your fetch operation:', error);
		return null;
	}
}

async function refresh_token(refresh)
{
	const infoLogin = {
		refresh_token: refresh
	};
	await getNewAccessToken(infoLogin);
	router();
}

///////////////////////////////////////// LOGIN INTRA ////////////////////////////////////////////////

function callBackAccess() {
    if (!getCookie("token"))
    {
        // console.log(getCookie('refresh'))
        const refresh = getCookie("refresh");
        if (refresh)
            refresh_token(refresh);
    }
    let vars = getPathVars();
    if (!vars["code"] || !vars["state"])
        return ;
    fetch('http://localhost:8080/loginIntra/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(getPathVars())
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data["access"])
        {
            clearURL();
            conectWB(data['access']);
            document.cookie = `token=${data["access"]}; expires=${expiresDate(data["token_exp"]).toUTCString()}; Secure; SameSite=Strict`;
            document.cookie = `refresh=${data["refresh"]}; expires=${expiresDate(data["refresh_exp"]).toUTCString()}; Secure; SameSite=Strict`;
            router();
        }
    })
    .catch(error => console.error('There has been a problem with your fetch operation:', error));
}

window.addEventListener('DOMContentLoaded', () => {
	callBackAccess();
});

//////////////////////////////////////////////////////////

export async function is_authenticated(access)
{
	if (!access) {
		return Promise.resolve(false);
	}
	return fetch('http://localhost:8080/verify_token/', {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + access,
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
			if (data['error'])
				return(false);
			return(true);
		})
		.catch(error => {
			console.error('There has been a problem with your fetch operation:', error);
			return false;
		});
}

//////////////////////////////////////////////////////////////