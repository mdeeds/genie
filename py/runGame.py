class RunGame:
    def run(self, game, strategy, states, moves):
        state = game.getInitialState()
        while not game.isWinning(state) and not game.isLosing(state):
            move = strategy.getMove(state)
            states.append(state)
            moves.append(move)
            state = game.applyMove(state, move)
        return game.isWinning(state)

    def collectWinData(self, game, strategy, winningStates, winningMoves):
        winCount = 0
        gameCount = 0
        # for _ in range(gameCount):
        while (winCount < 2000 and gameCount < 20000):
            states = []
            moves = []
            isWin = self.run(game, strategy, states, moves)
            if (isWin):
                for item in states:
                    winningStates.append(item)
                for item in moves:
                    winningMoves.append(item)
                winCount += 1
            gameCount += 1
        f = open("wins.txt", "a")
        f.write(str(winCount / gameCount) + "\n")
        f.close()
        print("Win rate: " + str(winCount / gameCount))
