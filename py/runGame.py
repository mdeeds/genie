class RunGame:
    # game play stops if either of these are achived.
    kMinWins = 200
    kMinGames = 1000

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
        while (winCount < self.kMinWins and gameCount < self.kMinGames):
            states = []
            moves = []
            isWin = self.run(game, strategy, states, moves)
            if (isWin):
                for item in states:
                    winningStates.append(item)
                for item in moves:
                    newItem = item.astype(int)
                    winningMoves.append(newItem)
                winCount += 1
            gameCount += 1
        winRate = winCount / gameCount
        f = open("wins.txt", "a")
        f.write(str(winRate) + "\n")
        f.close()
        print("Win rate: " + str(winRate))
        return winRate
