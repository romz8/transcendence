import { callApi42, is_authenticated, getCookie } from '../user_login';
import { router } from '/src/js/routes.js';
import { createToast } from '../components/toast';
import { updateUserInfo } from '../main';

const	TWO_MEGABYTES = 2*1024*1024;

class ProFile extends HTMLElement {
	constructor() {
		super();
		this.innerHTML = /* html */`
			<nav-bar data-authorized></nav-bar>
            <main class="container">
                <form id="update-form" class="col-sm-12 col-md-8 col-lg-6 login-form">
                    <div class="mb-5">
                        <h1 class="text-center">Profile</h1>
                        <p class="text-center">Update your profile info.</p>
                    </div>
                    <div class="mb-3 d-flex flex-column align-items-center">
						<div id="profile-pic" class="mb-2">
							<input id="input-profile-pic" name="imagefile" class="d-none" type="file" accept="image/*">
							<div class="fa-xl edit-profile-pic">
								<span class="fa-layers fa-fw">
									<i class="fa-regular  fa-pen-to-square"></i>
								</span>
							</div>
						</div>
						<h3>@${localStorage.getItem('username')}</h3>
					</div>
                    <div class="mb-3">
                        <label for="input-alias" class="form-label">Alias</label>
                        <input type="alias" class="form-control" id="input-alias" aria-describedby="aliasHelp" value="${localStorage.getItem('alias')}" minlength="2" maxlength="16" required>
                    </div>
                    <div class="mb-3 d-flex justify-content-between gap-3">
                        <div class="flex-grow-1">
                            <label for="input-name" class="form-label">Name</label>
                            <input type="text" class="form-control" id="input-name" aria-describedby="nameHelp" value="${localStorage.getItem('name')}" disabled>
                        </div>
                        <div class="flex-grow-1">
                            <label for="input-last-name" class="form-label">Last name</label>
                            <input type="text" class="form-control" id="input-last-name" aria-describedby="nameHelp" value="${localStorage.getItem('lastname')}" disabled>
                        </div>
                    </div>
					<div class="mb-3">
						<label for="input-campus" class="form-label">Campus</label>
						<input type="text" class="form-control" id="input-campus" aria-describedby="campusHelp" value="${localStorage.getItem('campus')}" disabled>
                    </div>
                    <button type="submit" id="update-submit-btn" class="btn btn-outline-cream-fill btn-general w-100 mb-3">Update</button>
                </form>
            </main>
		`;
	}
	connectedCallback() {

		const	updateSubmitBtn = document.getElementById('update-submit-btn');
		const	profilePic = document.getElementById('profile-pic');
		const	inputProfilePic = document.getElementById('input-profile-pic');

		profilePic.style.backgroundImage = `url('${localStorage.getItem('img')}')`;
		profilePic.addEventListener('click', () => {
			inputProfilePic.click();
		});

		// When a new file is selected, update the profile picture
		inputProfilePic.addEventListener('change', function(event) {
			const file = event.target.files[0];
			if (file) {
				if (file.size <= TWO_MEGABYTES) {
					const reader = new FileReader();
					reader.onload = (e) => {
						// Set the new image source to the profile picture
						profilePic.style.backgroundImage = `url('${e.target.result}'`;
					};
					reader.readAsDataURL(file); // Convert the file to a data URL
				}
				else {
					inputProfilePic.value = '';
					createToast('warning', 'File size too big');
				}
			}
		});

		const	inputAlias = document.getElementById('input-alias');
		const	updateForm = document.getElementById('update-form');
		updateForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const	dataUpdate = new FormData();
			dataUpdate.append('alias', inputAlias.value);
			dataUpdate.append('imagefile', inputProfilePic.files[0]);
			try {
				const response = await fetch('http://localhost:8080/update_info_user/', {
					method: 'POST',
					headers: {'Authorization': 'Bearer ' + getCookie('token')},
					body: dataUpdate,
				});
				if (!response.ok) {
					const responseJson = await response.json();
					throw (`${responseJson.error}`);
				}
				createToast('successful','Profile updated successfully');
				updateUserInfo();
				router();
			} catch (e) {
				createToast('warning',`Error: ${e.message}`);
			}
		});

	};
        
	
}

/* function    updateProfileInfo () {
	console.log(document.getElementById('alias').value);
	const infoLogin = {
		alias: document.getElementById('alias').value
	};
	fetch('http://localhost:8080/update_info_user/', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + getCookie('token'),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(infoLogin)
	})
		.then(response => {
			if (!response.ok)
				throw new Error('Network response was not ok ' + response.statusText);
			return response.json();
		})
		.then(data => {
			alert('info updated succesfully');
		})
		.catch(error => {
			console.error('There has been a problem with your fetch operation:', error);
			return false;
		});
} */

customElements.define('pro-file', ProFile);

export default  function profile () {
	return ('<pro-file></pro-file>');
}
