
class Signup extends HTMLElement {
	constructor() {
		super();
		this.innerHTML = /* html */`
			<nav-bar></nav-bar>
			<main class="container">
				<form id="signup-form" class="col-sm-12 col-md-8 col-lg-6 mt-5 login-form">
					<div class="mb-5">
						<h1 class="text-center">Sign up</h1>
						<p class="text-center">Please enter your details to register.</p>
					</div>
					<div class="mb-3 d-flex justify-content-between gap-3">
						<div class="flex-grow-1">
							<label for="input-name" class="form-label">Name</label>
							<input type="text" class="form-control" id="input-name" aria-describedby="nameHelp" placeholder="Enter your name" minlength="2" maxlength="16" required>
						</div>
						<div class="flex-grow-1">
							<label for="input-last-name" class="form-label">Last name</label>
							<input type="text" class="form-control" id="input-last-name" aria-describedby="nameHelp" placeholder="Enter your last name" minlength="2" maxlength="16" required>
						</div>
					</div>
					<div class="mb-3">
						<label for="input-username" class="form-label">Username</label>
						<input type="text" class="form-control" id="input-username" aria-describedby="usernameHelp" placeholder="Enter your username" minlength="3" maxlength="16" required>
					</div>
					<div class="mb-3 position-relative">
						<label for="input-pass" class="form-label">Password</label>
						<input type="text" class="form-control" id="input-pass" placeholder="Password" required>
						<div class="password-checklist">
							<p class="checklist-title">Password should be</h3>
							<ul class="checklist">
								<li class="list-item">  Between 8 and 16 character long</li>
								<li class="list-item">  At least 1 number</li>
								<li class="list-item">  At least 1 lowercase letter</li>
								<li class="list-item">  At least 1 uppercase letter</li>
								<li class="list-item">  At least 1 special character (!,@,#,$,%,^,&,_,=,+,-)</li>
							</ul>
						</div>
					</div>
					<div class="mb-3">
						<label for="input-pass-rep" class="form-label">Confirm password</label>
						<input type="password" class="form-control" id="input-pass-rep" placeholder="Password" required>
					</div>
					<button disabled type="submit" id="signup-submit-btn" class="btn btn-outline-cream-fill btn-general w-100 mb-3">Sign up</button>
				</form>
   			 </main>
		`;
	}
	connectedCallback() {
		const form = document.getElementById('signup-form');
		
		/*
			Changes disabled state of submit button depending on form validity
		*/
		form.addEventListener('input', () => {
    		document.getElementById('signup-submit-btn').disabled = !form.checkValidity();
		});
		
		/*
			Check uniqueness of username and sets error message,
			makes a requests to the DB
		*/
		const	inputUsername = document.getElementById('input-username');
		const	dbUsername = ['ferri17','adria1', 'diego2', 'romain3'];
		let	alertUsername = false;
		inputUsername.addEventListener('input', () => {
			let	foundIdentic = false;
			for (let i = 0; i < dbUsername.length; i++) {
				if (inputUsername.value === dbUsername.at(i)) {
					if (!alertUsername) {
						inputUsername.setCustomValidity('invalid');
						const alertMssg = document.createElement('p');
						alertMssg.textContent = 'Username already in use';
						alertMssg.classList.add('alert-message', 'alert-username');
						inputUsername.insertAdjacentElement('afterend', alertMssg);
						alertUsername = true;
						foundIdentic = true;
					}
					break ;
				}
			}
			if (!foundIdentic) {
				alertUsername = false;
				document.querySelector('.alert-message.alert-username')?.remove();
				inputUsername.setCustomValidity('');
			}
		
		});


		/*
			Check validity of password and set valid/invalid state:
				- Between 8 and 16 character long
				- At least 1 number
				- At least 1 lowercase letter
				- At least 1 uppercase letter
				- At least 1 special character (!,@,#,$,%,^,&,_,=,+,-)
		*/
		let validationRegex = [
			{ regex: /^.{8,16}$/ },
			{ regex: /[0-9]/ },
			{ regex: /[a-z]/ },
			{ regex: /[A-Z]/ }, 
			{ regex: /[!@#$%^&_=+-]/ }
		];

		const	inputPass = document.getElementById('input-pass');
		let passwordChecklist = document.querySelectorAll('.list-item');
		inputPass.addEventListener('input', () => {
			const passRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&_=+-]).{8,16}$');
			
			if (passRegex.test(inputPass.value))
				inputPass.setCustomValidity('');
			else 
				inputPass.setCustomValidity('invalid');

			validationRegex.forEach((item, i) => {
				let isValid = item.regex.test(inputPass.value);
			
				if (isValid)
					passwordChecklist[i].classList.add('checked');
				else
					passwordChecklist[i].classList.remove('checked');
			});
		});
		
		/* 
			Check confirm password input value and sets error message
			if password doesn't match. Also sets input state to 'invalid'.
		*/
		const	inputPassRep = document.getElementById('input-pass-rep');
		let	alertRep = false;
		inputPassRep.addEventListener('input', () => {
			if (inputPassRep.value != inputPass.value) {
				if (!alertRep) {
					inputPassRep.setCustomValidity('invalid');
					const alertMssg = document.createElement('p');
					alertMssg.textContent = 'Passwords don\'t match';
					alertMssg.classList.add('alert-message', 'alert-password');
					inputPassRep.insertAdjacentElement('afterend', alertMssg);
					alertRep = true;
				}
			}
			else {
				alertRep = false;
				document.querySelector('.alert-message.alert-password')?.remove();
				inputPassRep.setCustomValidity('');
			}
		});
	};	
}

customElements.define('sign-up', Signup);

export default  function signup () {
	return ('<sign-up></sign-up>');
}
