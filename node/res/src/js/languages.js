import i18next from 'i18next';

export function generateLangs(file, atributes = false)
{
	const savedLanguage = localStorage.getItem('language') || 'en';

	i18next.init({
		lng: savedLanguage,
		resources: {
			en: {
				translation: {
					play: 'Play',
					profile: 'Profile',
					language: 'Language',
					logout: "Log out",
					inProfile: "Profile",
					loginTitle: "Log In"
				}
			},
			es: {
				translation: {
					play: 'Jugar',
					profile: 'Perfil',
					language: 'Idioma',
					logout: "Salir",
					inProfile: "Perfil",
					loginTitle: "Iniciar Session"
				}
			},
			cat: {
				translation: {
					play: 'Jugar',
					profile: 'Perfil',
					language: 'Idioma',
					logout: "Surt",
					inProfile: "Perfil",
					loginTitle: "Inici de Sessio"
				}
			}
		}
	}, (err, t) => {
		changeItemLanguage(t)
	});
	
	function changeItemLanguage(t)
	{
		if (file === "navbar")
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
		}
	}

	const	languageSelectors = document.querySelectorAll('.language-select');
	
	
	languageSelectors.forEach(item => {
		item.addEventListener('click', () => {
			const	language_i18 = item.getAttribute('value');
			i18next.changeLanguage(language_i18, (err, t) => {
				changeItemLanguage(t)
			});
			localStorage.setItem('language', language_i18);
		});
	});
}