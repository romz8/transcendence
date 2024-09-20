from enum import Enum
import logging
import random
import uuid
from collections import deque
logger = logging.getLogger(__name__)

tournamentstatus = Enum('gamestatus', ['registering', 'ongoing', 'finished'])
match_status = Enum('matchstatus',['empty','playing','finished'])

class TournamentSerie:
    """
    Class representing a tournament series.
    Attributes:
        tournament_id (str): Unique identifier for the tournament.
        player_list (list): List of players participating in the tournament.
        size (int): Number of players in the tournament.
        match_list (list): List of MatchNode objects representing matches in the tournament.
    Methods:
        generate_tournament(): Generates the tournament bracket based on the number of players.
        tournament_simulation(): Simulates a sample tournament with generated players and matches.
    """

    def __init__(self, tournament_id, size):
        self.tournament_id = tournament_id
        self.player_list = []
        self.size = size
        self.match_list = []

    def generate_tournament(self):
        """
        Generates a single-elimination tournament bracket by creating matches between players.
        Algo steps are:
        1. **Validation of Tournament Size**
        2. **Random Shuffle of Players**
        3. **Conversion to Deque for Player Handling** popping off to simulate drawing players from a pool.
        4. **Initialization of Match Identifiers**
        5. **Creation of Initial Matches (First Round)**
            Pairs players two by two to create the first round of matches.
            Each pair of players is removed from the front of the deque and assigned to a `MatchNode`, representing a match.
            The `MatchNode` objects are stored in a dictionary (`round_match`) indexed by the round number for future reference.
        6. **Generating Subsequent Rounds**:
           Iteratively creates subsequent rounds by pairing winners from the previous round.
           Matches are linked by setting their `next_match` attribute to ensure the flow of the tournament structure.
           The process repeats until there is only one match left, which determines the tournament's winner.
        """
        if self.size not in [4, 8]:
            raise ValueError(f"Tournament can only be 4 or 8 players actual size is {self.size}")
        
        random.shuffle(self.player_list)
        players = deque(self.player_list)
        n = len(self.player_list)
        total_match = n - 1 #you have 7 m for 8 players, 3 for 4p
        id_match = int(generate_random_hex(),16)
        
        curr_round = 1
        round_match = {1:deque()}
        for i in range(n // 2): # half the number of players (4 m if 8), spaced by 2 to not repeat
            player1 = players.popleft()
            player2 = players.popleft()
            match = MatchNode(id_match, curr_round, player1, player2)
            round_match[curr_round].append(match)
            self.match_list.append(match)
            id_match += 1

        curr_round += 1
        prev_round=round_match[curr_round - 1]
        nb_match_round = len(prev_round)
        while (nb_match_round > 1):  #as long as previous round had more than one match (i.e. wasn't the final)
            round_match[curr_round] = deque()
            prev_round=round_match[curr_round - 1]
            while len(prev_round) > 0:
                match = MatchNode(id_match, curr_round)
                prev_match1 = prev_round.popleft() if prev_round else None #to protect ?
                prev_match2 = prev_round.popleft() if prev_round else None 
                if prev_match1:
                    prev_match1.next_match = match
                if prev_match2:
                    prev_match2.next_match = match
                round_match[curr_round].append(match)
                self.match_list.append(match)
                id_match += 1
            nb_match_round = len(round_match[curr_round])
            curr_round += 1

            
    def tournament_simulation(self):
        sample_players = [("player_" + str(x)) for x in range(self.size)]
        print(f"list of players {len(sample_players)} players is {sample_players}")
        self.player_list = sample_players
        self.generate_tournament()
        [print(match) for match in self.match_list]

        for m in self.match_list:
            logger.info(f" match is : {m}")
        

            
    def tournament_simulation(self):
        sample_players = [("player_" + str(x)) for x in range(self.size)]
        print(f"list of players {len(sample_players)} players is {sample_players}")
        self.player_list = sample_players
        self.generate_tournament()
        [print(match) for match in self.match_list]
            


class MatchNode:
    """
    Class representing a match in a tournament.
    Attributes:
        id (str): Unique identifier for the match (in hex format).
        round (int): The round number of the match.
        players (deque): A deque containing two players participating in the match.
        state (Enum): The current state of the match.
        winner (str): The winner of the match (if determined).
        next_match (MatchNode): Reference to the next match for the winner.
    Methods:
        __str__(): Returns a string representation of the match.
        finished(): Marks the match as finished.
        start(): Marks the match as started.
    """

    def __init__(self, id, round, player1=None, player2=None, next_match=None):
        self.id = hex(id)
        self.round = round
        self.players = deque([player1, player2])
        self.state = match_status.empty
        self.winner = None
        self.next_match = next_match

    def __str__(self):
        next_match = self.next_match.id if self.next_match else "unknown"
        return (f"ROUND {self.round} - Match id {self.id} between players : {self.players} - next match id is {next_match}")

    def finished(self):
        pass

    def start(self):
        pass

def generate_random_hex():
    return ''.join(random.choices('0123456789abcdef', k=16))



import sys

def main():
    if len(sys.argv) == 2:
        n = sys.argv[1]
        print(f"EXECUTING for a number of players :{n}")
        tourn = TournamentSerie("hex_0x12347", int(n))
        tourn.tournament_simulation()
    else:
        print("No arguments provided. please provide only 1")

if __name__ == "__main__":
    main()