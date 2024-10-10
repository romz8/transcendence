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
	else if (await getCookie('token')){
		try {
			const response = await fetch('https://localhost:3001/login/getLang/', {
				method: 'GET',
				headers: {'Authorization': 'Bearer ' + await getCookie('token')},
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
					hey_name: 'Hey, {{name}}!',
					welcome: 'Welcome to Transcendence!',
					wait_room: "Waiting Room",
					room_owner: "Room owner",
					attendee: "Attendee",
					serach_oponent: "Search Opponent",
					leave_room: "Leave Room",
					no_attendees: "No attendees yet.",
					ready_start: "Both players are present! Ready to start the game.",
					play_btn: "Play",
					waiting_oponent: "Waiting for an opponent to join...",
					room_expired: "This room has expired.",
					time_remaining: "Time remaining:",
					error: "Error",
					return_home: "Return Home",
					create_game: "Create Game",
					join_game:"Join Game",
					selector_game:"Join a Game: Select a Room",
					no_rooms:"No rooms are available to join.",
					close: "Close",
					fail_join: 'Failed to join room',
					error_select_room: "Please select a room!",
					join_tour: "Join Tournament",
					delete_wait_room: "Delete Waiting Room",
					conf_tourn: "Tournament Configuration",
					size_tourn: "Tournament Size",
					players: "Players",
					n_humans: "Number of humans: ",
					n_ias: "Number of IA: ",
					create: "Create",
					create_tour: "Create Tournament",
					no_tour: "No Tournaments are Open to register",
					select_tour: "Select Tournament",
					registred: "Registred",
					connecting: 'Connecting...',
					quit_room: 'Quit Room',
					player_1: 'Player 1',
					player_2: 'Player 2',
					score: 'Score:',
					room_not_found: 'Room Not Found',
					room_not_found_info: 'The room you are trying to access does not exist.',
					back_to_home: 'Go Back Home',
					connected: 'Connected',
					disconnected: 'Disconnected',
					go_to_tournament: 'Go To Tournament',
					leaving_waiting_room: 'Leaving waiting room',
					you_left_room: 'You left the room',
					game_over: "Game over",
					player_forfeit: 'Player forfeit',
					start: 'Start!',
					lost_forfeit: 'You lost the game by forfeit',
					won_forfeit: 'You won the game by forfeit',
					you_won: 'You won!',
					you_lost: 'You lost!',
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
					
					//////////////////////////////////////////////////
					match_play: 'Tienes un partido contra',
					waitroom_tournament: "Sala de espera para el torneo ID",
					you_are: "Eres",
					tournament_over: "Torneo Finalizado",
					playing_tournament: "Jugando el torneo ID",
					congrats: "¡Felicidades a",
					final_result: "Resultados finales",
					runner_up: "Subcampeón",
					tournament_date: "Fecha del torneo",
					wait_nxt_match: "Esperando tu próximo partido...",
					eliminated: "Has sido eliminado del torneo.",
					RO_tournament: "No estás registrado para este torneo :)"

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
					hey_name: 'Hola, {{name}}!',
					welcome: 'Benvingut a Transcendence!',
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

					/////////////////////
					match_play: 'Vous avez un match à jouer contre',
					waitroom_tournament: "Salle d'attente pour le tournoi ID",
					you_are: "Vous êtes",
					playing_tournament: "Jouant le tournoi ID",
					congrats: "Félicitations", //Félicitations à
					tournament_over: "Tournoi Terminé",
					final_result: "Résultats finaux",
					runner_up: "Finaliste",
					tournament_date: "Date du tournoi",
					wait_nxt_match: "En attente de votre prochain match...",
					eliminated: "Vous êtes éliminé du tournoi.",
					RO_tournament: "Vous n'êtes pas inscrit à ce tournoi. :)"
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