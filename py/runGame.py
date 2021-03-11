import numpy as np


class RunGame:
    # game play stops if either of these are achived.
    kMinWins = 100
    kMinGames = 2000

    def oneHotMove(self, move):
        maxValue = -1000
        maxIndex = 0
        result = np.zeros(len(move))
        for i in range(len(move)):
            result[i] = 0.1
            if (move[i] > maxValue):
                maxValue = move[i]
                maxIndex = i
        result[maxIndex] = 0.9
        return result

    def run(self, game, strategies, states, moves):
        state = game.getInitialState()
        currentPlayer = 0
        while not game.isEnded(state):
            move = strategies[currentPlayer].getMove(state)
            states[currentPlayer].append(state)
            moves[currentPlayer].append(self.oneHotMove(move))
            state = game.applyMove(state, move)
            currentPlayer = (currentPlayer + 1) % game.getPlayerCount()
        winner = game.getWinner(state)
        return winner

    def collectWinData(self, game, strategies, winningStates, winningMoves):
        winCount = 0
        gameCount = 0
        # for _ in range(gameCount):
        while (winCount < self.kMinWins and gameCount < self.kMinGames):
            states = []
            moves = []
            while len(states) < game.getPlayerCount():
                states.append([])
                moves.append([])
            winner = self.run(game, strategies, states, moves)
            if (winner >= 0):
                for item in states[winner]:
                    winningStates.append(item)
                for item in moves[winner]:
                    winningMoves.append(item)
                winCount += 1
            gameCount += 1
        winRate = winCount / gameCount
        f = open("wins.txt", "a")
        f.write(str(winRate) + "\n")
        f.close()
        print("Win rate: " + str(winRate))
        return winRate
