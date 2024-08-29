import { callApi42, is_authenticated, getCookie } from '../login';
import { router } from '/src/js/routes.js';

class SingUp extends HTMLElement {
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
            color: whire;
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
        <nav-bar data-authorized></nav-bar>
        <div class="form-container">
        <div class="form-box">
            <h2 class="text-center">Sign Up</h2>
            <div id="error-message" class="error-message">Invalid username or password.</div>
            <div class="form-group">
                <label for="alias">Alias</label>
                <input type="text" class="form-control" id="alias" placeholder="Insert Alias">
            </div>
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" class="form-control" id="name" placeholder="Insert Name">
            </div>
            <div class="form-group">
                <label for="lastName">Last Name</label>
                <input type="text" class="form-control" id="lastName" placeholder="Insert Last Name">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" class="form-control" id="password" placeholder="Insert Password">
            </div>
            <button id="register-btn" class="btn btn-outline-cream btn-login d-flex align-items-center justify-content-center gap-3 mt-3">Register</button>
        </div>
        </div>
		`;
	}
	connectedCallback() {
        const   registerBtn = document.getElementById('register-btn');
        registerBtn.addEventListener('click', getSignUp);
    };

}

function singUp(infoLogin)
{
    console.log(infoLogin)
    fetch('http://localhost:8080/singUp/', {
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
        if (data["exist"] == true)
            showError('User already exist.');
    })
    .catch(error => console.error('There has been a problem with your fetch operation:', error));
}

function getSignUp()
{
    const infoLogin = {
        username: document.getElementById("alias").value,
        lastname: document.getElementById("name").value,
        firstname: document.getElementById("lastName").value,
        password: document.getElementById("password").value
    }
    singUp(infoLogin);
}

customElements.define('sing-up', SingUp);

export default  function singup () {
		return ('<sing-up></sing-up>');
}
