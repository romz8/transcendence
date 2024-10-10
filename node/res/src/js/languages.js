import i18next from 'i18next';
import { getCookie } from './user_login.js';
import { createToast } from './components/toast.js';

export async function generateLangs()
{
	/* Sets language, hierarchy is local storage > database prefered language > english default */
	let	savedLanguage;
	if (localStorage.getItem('language')) {
		savedLanguage = localStorage.getItem('language');
	}
	else if (getCookie('token')){
		try {
			const response = await fetch('https://localhost:3001/login/getLang/', {
				method: 'GET',
				headers: {'Authorization': 'Bearer ' + getCookie('token')},
			});
			const	responseJson = await response.json();
			if (!response.ok) {
				throw new Error(`${responseJson.error}`);
			}
			savedLanguage = responseJson.language;
		  } catch (e) {
			createToast('warning', `Error: ${e}`);
		  }
	}
	else {
		savedLanguage = 'en';
	}

	i18next.init({
		lng: savedLanguage,
		fallbackLng: 'en',
		resources: {
			en: {
				translation: {
					play: 'Play',
					local_game: 'Local Game',
					online_game: 'Online Game',
					tournament: 'Tournament',
					profile: 'Profile',
					settings: 'Settings',
					friends: 'Friends',
					match_history: 'Match history',
					language: 'Language',
					catalan: 'Catalan',
					spanish: 'Spanish',
					english: 'English',
					french: 'French',
					logout: 'Log out',
					username: 'Username',
					input_username: 'Enter your username',
					password: 'Password',
					login: 'Log in',
					login_42: 'Log in with 42',
					no_account: 'Don\'t have an account? Sign up here',
					signup: 'Sign up',
					details_register: 'Please enter your details to register.',
					name: 'Name',
					input_name: 'Enter your name',
					last_name: 'Last name',
					input_last_name: 'Enter your last name',
					loading: 'Loading...',
					password_should: 'Password should be',
					check_between: 'Between 8 and 16 character long',
					check_number: ' At least 1 number',
					check_lower: ' At least 1 lowercase letter',
					check_upper: ' At least 1 uppercase letter',
					check_special: ' At least 1 special character (!,@,#,$,%,^,&,_,=,+,-)',
					password_rep: 'Confirm password',
					submit: 'Submit',
					profile_info: 'Update your profile info.',
					alias: 'Alias',
					campus: 'Campus',
					prefered_language: 'Preferred language',
					update: 'Update',
					friends: 'Friends',
					friends_info: 'Add, remove, and see your friends status.',
					add_friend: 'Add friend',
					no_pending_requets: 'No pending friend requests',
					friend_request: '{{alias}} (@{{username}}) wants to add you as a friend.',
					accept: 'Accept',
					reject: 'Reject',
					no_friends: 'No friends yet',
					match_history: 'Match history',
					match_history_info: 'View your last games and stats.',
					games_played: 'Games played',
					wins: 'Wins',
					defeats: 'Defeats',
					waitroom: 'Waitroom',
					waitroom_info: 'Create a new game or join an existing one.',
				}
			},
			es: {
				translation: {
					play: 'Jugar',
					local_game: 'Juego local',
					online_game: 'Juego en línea',
					tournament: 'Torneo',
					profile: 'Perfil',
					settings: 'Configuración',
					friends: 'Amigos',
					match_history: 'Historial de partidas',
					language: 'Idioma',
					catalan: 'Catalán',
					spanish: 'Español',
					english: 'Inglés',
					french: 'Francés',
					logout: 'Cerrar sesión',
					username: 'Nombre de usuario',
					input_username: 'Ingresa tu nombre de usuario',
					password: 'Contraseña',
					login: 'Iniciar sesión',
					login_42: 'Iniciar sesión con 42',
					no_account: '¿No tienes una cuenta?',
				}
			},
			ca: {
				translation: {
					play: 'Jugar',
					local_game: 'Joc local',
					online_game: 'Joc en línia',
					tournament: 'Torneig',
					profile: 'Perfil',
					settings: 'Configuració',
					friends: 'Amics',
					match_history: 'Historial de partides',
					language: 'Idioma',
					catalan: 'Català',
					spanish: 'Castellà',
					english: 'Anglès',
					french: 'Francès',
					logout: 'Tanca la sessió',
					username: 'Nom d\'usuari',
					input_username: 'Introdueix el teu nom d\'usuari',
					password: 'Contrasenya',
					login: 'Inicia sessió',
					login_42: 'Inicia sessió amb 42',
					no_account: 'No tens compte?',
					signup: 'Registra\'t',
					details_register: 'Introdueix les teves dades per registrar-te.',
					name: 'Nom',
					input_name: 'Introdueix el teu nom',
					last_name: 'Cognom',
					input_last_name: 'Introdueix el teu cognom',
					loading: 'Carregant...',
					password_should: 'La contrasenya ha de ser',
					check_between: ' Entre 8 i 16 caràcters de llargada',
					check_number: ' Almenys 1 número',
					check_lower: ' Almenys 1 lletra minúscula',
					check_upper: ' Almenys 1 lletra majúscula',
					check_special: ' Almenys 1 caràcter especial (!,@,#,$,%,^,&,_,=,+,-)',
					password_rep: 'Confirma la contrasenya',
					submit: 'Enviar',
					profile_info: 'Actualitza la teva informació de perfil.',
					alias: 'Àlies',
					campus: 'Campus',
					prefered_language: 'Idioma preferit',
					update: 'Actualitza',
					friends: 'Amics',
					friends_info: 'Afegeix, elimina i consulta l\'estat dels teus amics.',
					add_friend: 'Afegir amic',
					no_pending_requets: 'No hi ha peticions d\'amistat pendents',
					friend_request: '{{alias}} (@{{username}}) vol afegir-te com a amic.',
					accept: 'Accepta',
					reject: 'Rebutja',
					no_friends: 'Encara no tens amics',
					match_history: 'Historial de partides',
					match_history_info: 'Visualitza les teves últimes partides i estadístiques.',
					games_played: 'Partides jugades',
					wins: 'Victòries',
					defeats: 'Derrotes',
					waitroom: 'Sala d\'espera',
					waitroom_info: 'Crea una nova partida o uneix-te a una existent.',
				}
			},
			fr: {
				translation: {
					play: 'Jouer',
					local_game: 'Jeu local',
					online_game: 'Jeu en ligne',
					tournament: 'Tournoi',
					profile: 'Profil',
					settings: 'Paramètres',
					friends: 'Amis',
					match_history: 'Historique des matchs',
					language: 'Langue',
					catalan: 'Catalan',
					spanish: 'Espagnol',
					english: 'Anglais',
					french: 'Français',
					logout: 'Déconnexion',
					username: 'Nom d\'utilisateur',
					input_username: 'Entrez votre nom d\'utilisateur',
					password: 'Mot de passe',
					login: 'Se connecter',
					login_42: 'Se connecter avec 42',
					no_account: 'Pas de compte?',
				}
			}			
		}		
	}, (err, t) => {
		changeItemLanguage(t);
	});
	
	function changeItemLanguage(t)
	{
		const elementsTransText = document.querySelectorAll('[data-translate="text"]');
		const elementsTransPlaceholder = document.querySelectorAll('[data-translate="placeholder"]');
		
		elementsTransText.forEach( (element) => {
			element.textContent = t(element.getAttribute('data-key'));
		});

		elementsTransPlaceholder.forEach( (element) => {
			element.placeholder = t(element.getAttribute('data-key'));
		});
	}

	const	languageSelectors = document.querySelectorAll('.language-select');
	
	
	languageSelectors.forEach(item => {
		item.addEventListener('click', () => {
			const	language_i18 = item.getAttribute('value');
			i18next.changeLanguage(language_i18, (err, t) => {
				localStorage.setItem('language', language_i18);
				changeItemLanguage(t);
			});
			localStorage.setItem('language', language_i18);
		});
	});
}