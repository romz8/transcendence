import { callApi42, is_authenticated, getCookie } from '../login';
import { router } from '/src/js/routes.js';

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
        <div class="form-container">
        <div class="form-box">
            <h2 class="text-center">Log In</h2>
            <div id="error-message" class="error-message">Invalid username or password.</div>
            <div class="form-group">
                <label for="Username">Username</label>
                <input type="text" class="form-control" id="Username" placeholder="Insert Username">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" class="form-control" id="password" placeholder="Insert Password">
            </div>
            <button type="submit" class="btn btn-outline-cream btn-login d-flex align-items-center justify-content-center gap-3 mt-3">Log In</button>
        </div>
        </div>
		`;
	}
	connectedCallback() {
        // const   updateInfoBtn = document.getElementById('update-info-btn');
        // updateInfoBtn.addEventListener('click', updateProfileInfo);
    };
        
	
}

customElements.define('log-in', LogIn);

export default  function login () {
		return ('<log-in></log-in>');
}
