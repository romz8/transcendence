import { callApi42, is_authenticated, getCookie } from '../user_login';
import { router } from '/src/js/routes.js';
import { createToast } from '../components/toast';
import { updateUserInfo } from '../main';
import { generateLangs } from '../languages.js';

const	TWO_MEGABYTES = 2*1024*1024;

class ProFile extends HTMLElement {
	constructor() {
		super();
		this.innerHTML = /* html */`
		<nav-bar data-authorized></nav-bar>
		<main class="container">
			<form id="update-form" class="col-sm-12 col-md-8 col-lg-6 login-form">
				<div class="mb-5">
					<h1 class="text-center" data-translate="text" data-key="profile">Profile</h1>
					<p class="text-center" data-translate="text" data-key="profile_info">Update your profile info.</p>
				</div>
				<div class="mb-3 d-flex flex-column align-items-center">
					<div id="profile-pic" class="mb-2">
						<input id="input-profile-pic" name="imagefile" class="d-none" type="file" accept="image/*">
						<div class="fa-xl edit-profile-pic">
							<span class="fa-layers fa-fw">
								<i class="fa-regular fa-pen-to-square"></i>
							</span>
						</div>
					</div>
					<h3>@${localStorage.getItem('username')}</h3>
				</div>
				<div class="mb-3">
					<label for="input-alias" class="form-label" data-translate="text" data-key="alias">Alias</label>
					<input type="alias" class="form-control" id="input-alias" aria-describedby="aliasHelp" value="${localStorage.getItem('alias')}" minlength="2" maxlength="16" required>
				</div>
				<div class="mb-3">
					<label for="language-select" class="form-label" data-translate="text" data-key="prefered_language">Preferred language</label>
					<select id="language-select" class="form-select" aria-label="Default select example">
						<option value="ca" data-translate="text" data-key="catalan">Catalan</option>
						<option value="es" data-translate="text" data-key="spanish">Spanish</option>
						<option value="en" selected data-translate="text" data-key="english">English</option>
						<option value="fr" data-translate="text" data-key="french">French</option>
					</select>
				</div>
				<div class="mb-3 d-flex justify-content-between gap-3">
					<div class="flex-grow-1">
						<label for="input-name" class="form-label" data-translate="text" data-key="name">Name</label>
						<input type="text" class="form-control" id="input-name" aria-describedby="nameHelp" value="${localStorage.getItem('name')}" disabled>
					</div>
					<div class="flex-grow-1">
						<label for="input-last-name" class="form-label" data-translate="text" data-key="last_name">Last name</label>
						<input type="text" class="form-control" id="input-last-name" aria-describedby="nameHelp" value="${localStorage.getItem('lastname')}" disabled>
					</div>
				</div>
				<div class="mb-3">
					<label for="input-campus" class="form-label" data-translate="text" data-key="campus">Campus</label>
					<input type="text" class="form-control" id="input-campus" aria-describedby="campusHelp" value="${localStorage.getItem('campus')}" disabled>
				</div>
				<button type="submit" id="update-submit-btn" class="btn btn-outline-cream-fill btn-general w-100 mb-3" data-translate="text" data-key="update">Update</button>
			</form>
		</main>
	`;

	}
	async connectedCallback() {

		/* Set language selected value */
		const	languageSelect = document.getElementById('language-select');
		 try {
			const response = await fetch('https://localhost:3001/login/getLang/', {
				method: 'GET',
				headers: {'Authorization': 'Bearer ' + await getCookie('token')},
			});
			const responseJson = await response.json();
			if (!response.ok) {
				throw (`${responseJson.error}`);
			}
			languageSelect.value = responseJson.language;
		} catch (e) {
			createToast('warning',`Error: ${e.message}`);
		}

		/* Set profile picture image and event listener to edit it */
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

		/* Manage submit button to store profile changes in database */
		const	inputAlias = document.getElementById('input-alias');
		const	updateForm = document.getElementById('update-form');
		updateForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const	dataUpdate = new FormData();
			dataUpdate.append('alias', inputAlias.value);
			dataUpdate.append('imagefile', inputProfilePic.files[0]);
			dataUpdate.append('language', languageSelect.value);
			try {
				const response = await fetch('https://localhost:3001/login/update_info_user/', {
					method: 'POST',
					headers: {'Authorization': 'Bearer ' + await getCookie('token')},
					body: dataUpdate,
				});
				if (!response.ok) {
					const responseJson = await response.json();
					throw (`${responseJson.error}`);
				}
				localStorage.setItem('language', languageSelect.value);
				createToast('successful','Profile updated successfully');
				updateUserInfo();
				router();
			} catch (e) {
				createToast('warning',`Error: ${e.message}`);
			}
		});
		/* Translate language, needed in async connectedCallback() to make sure it's executed */
		generateLangs();
	};

}

customElements.define('pro-file', ProFile);

export default  function profile () {
	return ('<pro-file></pro-file>');
}
