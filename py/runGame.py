import numpy as np
from numpy.lib.function_base import append
from gamePairs import GamePairs


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

    def run(self, game, strategies, verbose=0):
        state = game.getInitialState()
        states = list()
        moves = list()
        for _ in range(game.getPlayerCount()):
            states.append(list())
            moves.append(list())
        game.startGame()
        currentPlayer = game.playerIndex
        while not game.isEnded(state):
            if verbose > 0:
                game.showState(state)
            move = strategies[currentPlayer].getMove(state)
            states[currentPlayer].append(state)
            moves[currentPlayer].append(self.oneHotMove(move))
            state = game.applyMove(state, move)
            currentPlayer = game.nextPlayer()
        winner = game.getWinner(state)
        if verbose > 0:
            game.showState(state)
        return winner, states, moves

    def collectWinData(self, game, strategies, trainingPairs):
        winCount = 0
        gameCount = 0
        # for _ in range(gameCount):
        while (winCount < self.kMinWins and gameCount < self.kMinGames):
            states = []
            moves = []
            # while len(states) < game.getPlayerCount():
            #     states.append([])
            #     moves.append([])
            winner, states, moves = self.run(game, strategies)
            for player in range(len(states)):
                isWinner = player == winner
                for i in range(len(states[player])):
                    state = states[player][i]
                    move = moves[player][i]
                    trainingPairs.append(state, move, isWinner)
            if winner == 0:
                winCount += 1
            gameCount += 1
        winRate = winCount / gameCount
        f = open("wins.txt", "a")
        f.write(str(winRate) + "\n")
        f.close()
        print("Win rate: " + str(winRate))
        return winRate
