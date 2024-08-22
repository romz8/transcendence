
CREATE TABLE Users(
    id VARCHAR(50) PRIMARY KEY,
    password VARCHAR(200),
    alias VARCHAR(50) NOT NULL,
    campus VARCHAR(100),
    name VARCHAR(30),
    lastname VARCHAR(140),
    img VARCHAR(300) NOT NULL,
    intra BOOLEAN NOT NULL
);

CREATE TABLE Friends(
    UsersId1 VARCHAR(50),
    UsersId2 VARCHAR(50),
    pending BOOLEAN DEFAULT true,
    PRIMARY KEY (UsersId1, UsersId2),
    FOREIGN KEY (UsersId1) REFERENCES Users(id),
    FOREIGN KEY (UsersId2) REFERENCES Users(id)
);

CREATE TABLE Tournament(
    id SERIAL PRIMARY KEY,
    WinnerId VARCHAR(50),
    dateTourn TIMESTAMP,
    hexBlock VARCHAR(100),
    FOREIGN KEY (WinnerId) REFERENCES Users(id)
);

CREATE TABLE Match(
    id SERIAL PRIMARY KEY,
    UsersId1 VARCHAR(50) NOT NULL,
    UsersId2 VARCHAR(50),
    dataMatch TIMESTAMP,
    score VARCHAR(5),
    tournamentId SERIAL,
    FOREIGN KEY (UsersId1) REFERENCES Users(id),
    FOREIGN KEY (UsersId2) REFERENCES Users(id),
    FOREIGN KEY (tournamentId) REFERENCES Tournament(id)
);

CREATE TABLE MatchHistorty(
    UsersId VARCHAR(50),
    MatchId SERIAL,
    FOREIGN KEY (UsersId) REFERENCES Users(id),
    FOREIGN KEY (MatchId) REFERENCES Match(id)
);


CREATE TABLE TourParticipation(
    UsersId VARCHAR(50),
    tournamentId SERIAL,
    FOREIGN KEY (UsersId) REFERENCES Users(id),
    FOREIGN KEY (tournamentId) REFERENCES Tournament(id)
);
