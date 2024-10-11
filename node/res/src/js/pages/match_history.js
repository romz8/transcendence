import { getCookie } from '../user_login';
import i18next from 'i18next';
import { Chart, ArcElement, Tooltip, Legend, Title, PieController, LineController, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';

// Register the necessary components
Chart.register(
    ArcElement,    // For drawing pie chart slices
    Tooltip,       // For showing tooltips on hover
    Legend,        // For showing the legend
    PieController, // For the 'pie' chart type
    LineController, // For the 'line' chart type
    CategoryScale, // For the 'line' chart type
    LinearScale,   // For the 'line' chart type
    PointElement,         // For the 'line' chart type
    LineElement,         // For the 'line' chart type
    Title          // Optional, if you want a title
);

class MatchHistory extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = /* html */`
            <nav-bar data-authorized></nav-bar>
            <main class="container">
                <div class="col-sm-12 col-md-9 col-lg-6 mx-auto">
                    <div class="mb-5 row">
                        <h1 class="text-center krona-font" data-translate="text" data-key="match_history">Match history</h1>
                        <p class="text-center" data-translate="text" data-key="match_history_info">View your last games and stats.</p>
                    </div>
                    <section class="mb-5">
                        <div class="row justify-content-between">
                            <span class="col d-flex flex-column align-items-center">
                                <h2 id="game-counter" class="krona-font fs-1">24</h2>
                                <p data-translate="text" data-key="games_played">Games played</p>
                            </span>
                            <span class="col d-flex flex-column align-items-center">
                                <h2 id="wins-counter" class="krona-font fs-1">16</h2>
                                <p data-translate="text" data-key="wins">Wins</p>
                            </span>
                            <span class="col d-flex flex-column align-items-center">
                                <h2 id="losses-counter" class="krona-font fs-1">8</h2>
                                <p data-translate="text" data-key="defeats">Defeats</p>
                            </span>
                            <div class="row mt-3">
                                <div class="d-flex col-md-6">
                                    <canvas id="games-chart" class="primary-bg-color-subtle p-5 rounded"></canvas>
                                </div>
                                <div class="d-flex col-md-6">
                                    <canvas id="goals-chart" class="primary-bg-color-subtle p-5 rounded"></canvas>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="d-flex col-md-12">
                                    <canvas id="winrate-chart" class="primary-bg-color-subtle p-5 rounded"></canvas>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section id='matches-container' class="d-flex flex-column gap-3 mb-5">
                    </section>
                </div>
            </main>
        `;
        this.chart = null;  // Variable to hold the chart instance
    }

    async connectedCallback() {
        let totalGames = 0;
        let totalWins = 0;
        let totalLosses = 0;
        let goalsScored = 0;
        let goalsConceded = 0;
        let currentGames = 0;
        let currentWins = 0;
        let winrate = [0];
        let gamesPlayed = [0];
        
        fetch('https://localhost:3001/tourapi/game/allmatch/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + await getCookie('token'),
                'Content-Type': 'application/json'
            },
        })
        .then(response => {
            if (!response.ok)
                throw new Error('Network response was not ok ' + response.statusText);
            return response.json();
        })
        .then(data => {

            const matchesContainer = document.getElementById('matches-container');
            totalGames = data.length;
            totalWins = data.filter(match => match.winner).length;
            totalLosses = totalGames - totalWins;

            document.getElementById('game-counter').innerText = totalGames;
            document.getElementById('wins-counter').innerText = totalWins;
            document.getElementById('losses-counter').innerText = totalLosses;
            
            // Create match cards
            data.map(match => {
                currentGames++;
                gamesPlayed.push(currentGames);
                const matchCard = document.createElement('div');
                if (match.winner === true) {
                    currentWins++;
                    matchCard.classList.add('w-100', 'match-card', 'match-card-win');
                    if (match.score_p1 > match.score_p2) {
                        goalsScored += match.score_p1;
                        goalsConceded += match.score_p2;
                    }
                    else {
                        goalsScored += match.score_p2;
                        goalsConceded += match.score_p1;
                    }
                }
                else {
                    matchCard.classList.add('w-100', 'match-card', 'match-card-defeat');
                    if (match.score_p1 < match.score_p2) {
                        goalsScored += match.score_p1;
                        goalsConceded += match.score_p2;
                    }
                    else {
                        goalsScored += match.score_p2;
                        goalsConceded += match.score_p1;
                    }
                }
                winrate.push(currentWins / currentGames * 100);
                matchCard.innerHTML = /* html */`
                    <div class="d-flex justify-content-between">
                    <p class="match-card-type mb-0">${getMatchType(match.tournament)}</p>
                    <p class="match-card-type mb-0">${match.winner? 'Victroy':'Defeat'}</p>
                    </div>
                    <div class="d-flex justify-content-center gap-5 align-items-center">
                    <div class="d-flex align-items-center gap-3">
                        <div class="match-card-pic"></div>
                        <p class="mb-0">${match.player1.alias}</p>
                    </div>
                    <p class="match-card-score krona-font fs-2 mb-0">${match.score_p1} - ${match.score_p2}</p>
                    <div class="d-flex align-items-center gap-3">
                        <p class="mb-0">${match.player2.alias}</p>
                        <div class="match-card-pic"></div>
                    </div>
                    </div>
                    <div class="d-flex justify-content-end gap-3 mb-0">
                    <p class="mb-0">${timeAgo(match.game_date)}</p>
                    </div>
                `;
            
                matchesContainer.appendChild(matchCard);
            });
            // Draw the chart
            this.drawChartGames(totalWins, totalLosses);
            this.drawChartGoals(goalsScored, goalsConceded);
            this.drawChartWinrate(winrate, gamesPlayed);
        })
        .catch(error => {
            return false;
        });
    }

    drawChartGames(totalWins, totalLosses) {
        
        const xValues = [i18next.t('wins'), i18next.t('defeats')];
        const yValues = [totalWins, totalLosses];
        const barColors = ["#00aba9", "#b91d47"];
        
        // Create a new chart
        this.chart = new Chart("games-chart", {
            type: "pie",  // 'pie' chart type
            data: {
                labels: xValues,
                datasets: [{
                    backgroundColor: barColors,
                    data: yValues,
                }]
            },
            options: {
                plugins: {
                    legend: { 
                        display: true, 
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 20
                            }
                        }
                    },
                    tooltip: { enabled: true }
                }
            }
        });
    }
    drawChartGoals(goalsScored, goalsConceded) {
       

        const xValues = [i18next.t('scored'), i18next.t('conceded')];
        const yValues = [goalsScored, goalsConceded];
        const barColors = ["#00aba9", "#b91d47"];
        
        // Create a new chart
        this.chart = new Chart("goals-chart", {
            type: "pie",  // 'pie' chart type
            data: {
                labels: xValues,
                datasets: [{
                    backgroundColor: barColors,
                    data: yValues,
                }]
            },
            options: {
                plugins: {
                    legend: { 
                        display: true, 
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 20
                            },
                        }
                    },
                    tooltip: { enabled: true }
                }
            }
        });
    }
    drawChartWinrate(winrate, gamesPlayed) {
        const xValues = gamesPlayed;
        const yValues = winrate;
        const barColors = ["#00aba9", "#b91d47"];
    
        // Create a new chart
        this.chart = new Chart("winrate-chart", {
            type: "line",
            data: {
                labels: xValues,
                datasets: [{
                    fill: false,
                    lineTension: 0,
                    backgroundColor: "rgba(0,0,255,1.0)",
                    borderColor: "rgba(0,0,255,0.1)",
                    data: yValues
                }]
            },
            options: {
                plugins: {
                    legend: { display: false},
                    tooltip: { enabled: true },
                    title: {
                        display: false,
                      }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Games Played',
                        font: {
                            size: 20
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Winrate (%)',
                        font: {
                            size: 20
                        }
                    }
                }
            }
            }
        });
    }

    
}

function timeAgo(date) {
    const now = new Date();
    const gameDate = new Date(date);
    const difference = Math.floor((now - gameDate) / (1000 * 60 * 60 * 24));

    if (difference === 0) return 'Today';
    else if (difference === 1) return '1 day ago';
    else return `${difference} days ago`;
}

function getMatchResult(scoreP1, scoreP2) {
    return scoreP1 > scoreP2 ? 'Victory' : 'Defeat';
}

function getMatchType(tournament){
    return tournament ? 'Tournament': 'Regular';
}

customElements.define('match-history', MatchHistory);

export default function matchHistory () {
    return ('<match-history></match-history>');
}
