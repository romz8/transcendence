import i18next from 'i18next';

export function generateLangs()
{
	const savedLanguage = localStorage.getItem('language') || 'en';

	i18next.init({
		lng: savedLanguage,
		resources: {
			en: {
				translation: {
					play: 'Play',
					profile: 'Profile',
					settings: 'Settings',
					settings: 'Settings',
					friends: 'Friends',
					match_history: 'Match history',
					language: 'Language',
					catalan: 'Catalan',
					spanish: 'Spanish',
					english: 'English',
					french: 'French',
					logout: "Log out",
				}
			},
			es: {
				translation: {
					play: 'Jugar',
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
				}
			},
			ca: {
				translation: {
					play: 'Jugar',
					profile: 'Perfil',
					settings: 'Configuració',
					friends: 'Amics',
					match_history: 'Historial de partides',
					language: 'Idioma',
					catalan: 'Català',
					spanish: 'Espanyol',
					english: 'Anglès',
					french: 'Francès',
					logout: 'Tancar sessió',
				}
			},
			fr: {
				translation: {
					play: 'Jouer',
					profile: 'Profil',
					settings: 'Paramètres',
					friends: 'Amis',
					match_history: 'Historique des matchs',
					language: 'Langue',
					catalan: 'Catalan',
					spanish: 'Espagnol',
					english: 'Anglais',
					french: 'Français',
					logout: 'Se déconnecter',
				}
			}			
		}
	}, (err, t) => {
		changeItemLanguage(t)
	});
	
	function changeItemLanguage(t)
	{
		/* Navbar */
		changeLanguageElementContent(document.getElementById('play-btn'), t('play'));
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