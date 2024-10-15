# Transcendence

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies](#technologies)
- [Modules Implemented](#modules-implemented)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Security](#security)
- [License](#license)

## Introduction
**Transcendence** is a web-based Pong game developed as part of the *ft_transcendence* project at 42. This is 42's common core capstone project, where students explore new technologies and develop a robust, scalable web application. The game supports real-time multiplayer Pong, along with various advanced modules to extend functionality, such as AI opponents, secure authentication, user management and blockchain integration for tournament scores.

Grade: **125/100**

## Features
- **Real-Time Pong Gameplay**: Play the classic Pong game against other players online in real time.
- **Tournaments**: Organize and participate in tournaments with matchmaking and tracking.
- **User Authentication**: Secure registration and login system for players.
- **AI Opponent**: Challenge an AI opponent with dynamic behavior.
- **Customization**: Players can adjust game settings, including power-ups and different maps.
- **Live Chat**: Communicate with other players during gameplay and tournaments.
- **Game History**: Track your performance, wins, and losses through a user profile.
- **Blockchain Integration**: Tournament scores are securely stored using Ethereum smart contracts.
- **Microservices Architecture**: Backend designed with microservices for flexibility and scalability.

## Technologies
- **Frontend**: Vanilla JavaScript, Bootstrap (for UI/UX).
- **Backend**: Django (framework for the backend) and Django Rest Framework (APIs)
- **Database**: PostgreSQL.
- **Blockchain**: Ethereum (for storing tournament scores). Sepolia is used as testing chain
- **Docker**: Used to containerize the applications (backend is implemented as microservices).
- **WebSockets**: For real-time communication during gameplay.

## Modules Implemented
Here are the major and minor modules selected for this project:

### Major Modules:
1. **Web Framework**: A backend framework (Django) is used to manage game logic, user management, and interactions.
2. **Database Integration**: PostgreSQL is used as the database for storing user data and game information.
3. **Blockchain for Tournament Scores**: Tournament scores are securely stored on the Ethereum blockchain.
4. **Standard User Management**: Players can register, log in, and manage their profiles, with authentication across tournaments.
5. **Remote Authentication (OAuth)**: Secure authentication using OAuth 2.0 with the 42 platform.
6. **Remote Players**: Play against players remotely in real-time Pong matches.
7. **AI Opponent**: An AI opponent with dynamic behavior is introduced for single-player gameplay.
8. **Microservices**: The backend is designed using microservices architecture for flexibility and scalability.

### Minor Modules:
1. **Frontend Framework**: Bootstrap is used for designing a responsive and user-friendly interface.
2. **User and Game Stats Dashboards**: Dashboards for tracking and displaying user and game statistics.
3. **Expanding Browser Compatibility**: The game supports multiple browsers, ensuring a seamless user experience across different platforms.
4. **Multiple Language Support**: The game supports multiple languages, catering to a diverse user base.

## Getting Started
To run this project, ensure you have the following prerequisites installed:
- Docker
- Docker-Compose
- A modern browser (Google Chrome recommended)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/romz8/transcendence.git
   cd transcendence
   ```

2. Build and run the Docker container
   ```bash
   docker-compose up --build
   ```
2 (bis). Or simply run make:
  ```bash
  make 
   ```

This command will set up both the frontend and backend using Docker. The application will be accessible at `https://localhost:3001`.

## Usage
- Access the game by navigating to the main URL after running the Docker container.
- Players can register, log in, and join a game against other online players.
- If no opponents are available, players can challenge the AI.
- View and manage your profile, including match history and stats.

## Security
- Passwords are securely hashed before being stored.
- The platform is protected against SQL injection and XSS attacks.
- Secure WebSockets (wss) and HTTPS are enforced.
- JWT are implemented for enhanced authentication security.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact
For any inquiries, feel free to reach out:
- **GitHub**: [romz8](https://github.com/romz8)
