import i18next from 'i18next';

export function generateLangs()
{
	const savedLanguage = localStorage.getItem('language') || 'en';

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
					check_number: 'At least 1 number',
					check_lower: 'At least 1 lowercase letter',
					check_upper: 'At least 1 uppercase letter',
					check_special: 'At least 1 special character (!,@,#,$,%,^,&,_,=,+,-)',
					password_rep: 'Confirm password',
					submit: 'Submit',
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
		/* Navbar */
		changeLanguageElementContent(document.getElementById('play-btn'), t('play'));
		changeLanguageElementContent(document.getElementById('local-game-text'), t('local_game'));
		changeLanguageElementContent(document.getElementById('online-game-text'), t('online_game'));
		changeLanguageElementContent(document.getElementById('tournament-text'), t('tournament'));

		changeLanguageElementContent(document.getElementById('profile-btn'), t('profile'));

		changeLanguageElementContent(document.getElementById('settings-text'), t('settings'));
		changeLanguageElementContent(document.getElementById('friends-text'), t('friends'));
		changeLanguageElementContent(document.getElementById('match-history-text'), t('match_history'));
		changeLanguageElementContent(document.getElementById('logout-text'), t('logout'));

		changeLanguageElementContent(document.getElementById('language-btn'), t('language'));

		changeLanguageElementContent(document.getElementById('ca-btn'), t('catalan'));
		changeLanguageElementContent(document.getElementById('es-btn'), t('spanish'));
		changeLanguageElementContent(document.getElementById('en-btn'), t('english'));
		changeLanguageElementContent(document.getElementById('fr-btn'), t('french'));

		changeLanguageElementContent(document.getElementById('language'), t('language'));

		/* Home out */
		changeLanguageElementContent(document.getElementById('label-username'), t('username'));
		changeLanguagePlaceholder(document.getElementById('input-username'), t('input_username'));
		changeLanguageElementContent(document.getElementById('label-pass'), t('password'));
		changeLanguagePlaceholder(document.getElementById('input-pass'), t('password'));
		changeLanguageElementContent(document.getElementById('login-username-btn'), t('login'));
		changeLanguageElementContent(document.getElementById('login-42-txt'), t('login_42'));
		changeLanguageElementContent(document.getElementById('signup-txt'), t('no_account'));


		/* Sign up */
		changeLanguageElementContent(document.getElementById('signup'), t('signup')); 
		changeLanguageElementContent(document.getElementById('details-register'), t('details_register')); 
		changeLanguageElementContent(document.getElementById('name-label'), t('name')); 
		changeLanguagePlaceholder(document.getElementById('input-name'), t('input_name')); 
		changeLanguageElementContent(document.getElementById('last-name-label'), t('last_name')); 
		changeLanguagePlaceholder(document.getElementById('input-last-name'), t('input_last_name')); 
		changeLanguageElementContent(document.getElementById('username-label'), t('username')); 
		changeLanguagePlaceholder(document.getElementById('input-username'), t('input_username')); 
		changeLanguageElementContent(document.getElementById('loading'), t('loading')); 
		changeLanguageElementContent(document.getElementById('password-should'), t('password_should')); 
		changeLanguageElementContent(document.getElementById('check-between'), t('check_between')); 
		changeLanguageElementContent(document.getElementById('check-number'), t('check_number')); 
		changeLanguageElementContent(document.getElementById('check-lower'), t('check_lower')); 
		changeLanguageElementContent(document.getElementById('check-upper'), t('check_upper')); 
		changeLanguageElementContent(document.getElementById('check-special'), t('check_special')); 
		changeLanguagePlaceholder(document.getElementById('label-pass-rep'), t('password_rep')); 
		changeLanguageElementContent(document.getElementById('input-pass-rep'), t('password')); 
		changeLanguageElementContent(document.getElementById('signup-submit-btn'), t('submit')); 

		/* Profile */

		
		/* if (file === "navbar")
		{
			if (atributes)
			{
				document.getElementById('play').innerText = t('play');
				document.getElementById('profile').innerText = t('profile');
				document.getElementById('inProfile').innerText = t('inProfile');
				document.getElementById('logout-btn').innerText = t('logout');
			}
			document.getElementById('language').innerText = t('language');
		}
		if (file === "login")
		{
			document.getElementById('login-title').innerText = t('loginTitle')
		} */
	}

	function	changeLanguageElementContent(element, translation) {
		if (element) {
			element.textContent = translation;
		}
	}
	function	changeLanguagePlaceholder(element, translation) {
		if (element) {
			element.placeholder = translation;
		}
	}

	const	languageSelectors = document.querySelectorAll('.language-select');
	
	
	languageSelectors.forEach(item => {
		item.addEventListener('click', () => {
			const	language_i18 = item.getAttribute('value');
			i18next.changeLanguage(language_i18, (err, t) => {
				console.log(item.getAttribute('value'));
				changeItemLanguage(t);
			});
			localStorage.setItem('language', language_i18);
		});
	});
}