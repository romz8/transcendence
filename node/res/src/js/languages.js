/* import i18next from 'i18next';

i18next.init({
	lng: 'en',
	resources: {
		en: {
			translation: {
				key: 'hello world'
			}
		}
	}
});

console.log(i18next.t('key')); */

import i18next from 'i18next';

const	languageSelectors = document.querySelectorAll('.language-select');

languageSelectors.forEach(item => {
	item.addEventListener('click', () => {
		const	language_i18 = item.getAttribute('value');
		console.log(language_i18);
		i18next.changeLanguage(language_i18, (err, t) => {
			t('key');
		});
	});
});
