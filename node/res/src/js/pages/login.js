import { generateLangs } from "/src/js/languages.js";
import { expiresDate } from "../login.js"

class LogIn extends HTMLElement {
	constructor() {
		super();
		this.innerHTML = /* html */`
        <style>

        body, html {
            height: 100%;
            margin: 0;
        }
        .form-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .form-box {
            background-color: #212529; /* Fondo de la caja */
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
            color: white;
        }
        .form-control {
            background-color: #343a40;
            border: none;
            color: white;
        }
        .form-control:focus {
            box-shadow: none;
            color: white;
            border-color: #495057;
        }
        ::placeholder{
            color: white !important;
            opacity: 0.66 !important;
        }
        .error-message {
            border-radius: 0.4em;
            background-color: #fe4f4f;
            color: white;
            margin-top: 10px;
            display: none;
            text-align: center;
        }

        body, html {
            height: 100%;
            margin: 0;
        }
        .form-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .form-box {
            background-color: #212529; /* Fondo de la caja */
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
            color: white;
        }
        .form-control {
            background-color: #343a40;
            border: none;
            color: white;
        }
        .form-control:focus {
            box-shadow: none;
            color: white;
            border-color: #495057;
        }
        ::placeholder{
            color: white !important;
            opacity: 0.66 !important;
        }
        .form-group-inline {
            display: flex;
            align-items: center;
        }
        .form-group-inline .form-control {
            margin-right: 10px;
        }
        </style>
        <nav-bar></nav-bar>
        <div class="form-container">
        <div class="form-box">
            <h2 class="text-center" id="login-title">Log In</h2>
            <div id="error-message" class="error-message">Invalid username or password.</div>
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" class="form-control" id="username" placeholder="Insert Username">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" class="form-control" id="password" placeholder="Insert Password">
            </div>
            <button id="login-btn" class="btn btn-outline-cream btn-login d-flex align-items-center justify-content-center gap-3 mt-3">Log In</button>
        </div>
        </div>
		`;
	}
	connectedCallback() {
		generateLangs("login")
        const   loginBtn = document.getElementById('login-btn');
        loginBtn.addEventListener('click', getLoginWeb);
    };
        
	
}

function showError(message) {
    const errorMessageDiv = document.getElementById('error-message');
    errorMessageDiv.innerText = message;
    errorMessageDiv.style.display = 'block';
}

function loginWeb(infoLogin) {
    fetch('http://localhost:8080/loginWeb/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(infoLogin)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data["error"] == "Invalid credentials")
        {
            showError('Invalid username or password.');
        }
        else
        {
            alert('Login successful');
            document.cookie = "token=" + data["access"] + "; expires=" + expiresDate(data["token_exp"]) + "; Secure; SameSite=Strict";
            document.cookie = "refresh=" + data["refresh"] + "; expires=" + expiresDate(data["refresh_exp"]) + "; Secure; SameSite=Strict";
        }
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}

function getLoginWeb()
{
    const infoLogin = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    }
    loginWeb(infoLogin);
}

customElements.define('log-in', LogIn);

export default  function login () {
		return ('<log-in></log-in>');
}
