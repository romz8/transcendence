import i18next from 'i18next';

export function generateLangs(file)
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
					inProfile: "Profile"
				}
			},
			es: {
				translation: {
					play: 'Jugar',
					profile: 'Perfil',
					language: 'Idioma',
					logout: "Salir",
					inProfile: "Perfil"
				}
			},
			cat: {
				translation: {
					play: 'Jugar',
					profile: 'Perfil',
					language: 'Idioma',
					logout: "Surt",
					inProfile: "Perfil"
				}
			}
		}
	}, (err, t) => {
		// Actualiza el contenido después de la inicialización
		if (file === "navbar") {
			document.getElementById('play').innerText = t('play');
			document.getElementById('profile').innerText = t('profile');
			document.getElementById('language').innerText = t('language');
			document.getElementById('inProfile').innerText = t('inProfile');
			document.getElementById('logout-btn').innerText = t('logout');
		}
	});
	
	const	languageSelectors = document.querySelectorAll('.language-select');
	
	
	languageSelectors.forEach(item => {
		item.addEventListener('click', () => {
			const	language_i18 = item.getAttribute('value');
			i18next.changeLanguage(language_i18, (err, t) => {
				if (file === "navbar")
				{
					document.getElementById('play').innerText = t('play');
					document.getElementById('profile').innerText = t('profile');
					document.getElementById('language').innerText = t('language');
					document.getElementById('inProfile').innerText = t('inProfile');
					document.getElementById('logout-btn').innerText = t('logout');
				}
			});
			localStorage.setItem('language', language_i18);
		});
	});
}