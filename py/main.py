from goodStrategy import GoodStrategy
from modelStrategy import ModelStrategy
from oneDie import OneDie
from runGame import RunGame


def main():
    g = OneDie()
    s = GoodStrategy(g)

    print("Starting.")

    runner = RunGame()
    trainingStates = []
    trainingMoves = []

    bestModel = None
    bestModelRate = 0
    runner.kMinWins = 1E5
    runner.kMinGames = 1E7
    runner.collectWinData(g, [s], trainingStates, trainingMoves)
    print("Collected " + str(len(trainingMoves)) + " moves.")

    for count in range(24):
        m = ModelStrategy(g)
        m.train(trainingStates, trainingMoves)
        runner.kMinWins = 1E4
        runner.kMinGames = 1E6
        mrate = runner.collectWinData(g, [m], trainingStates, trainingMoves)

        if mrate > bestModelRate:
            bestModel = m
    SaveDecisionMatrix(g, bestModel)


def SaveDecisionMatrix(g, m):
    for round in range(5):
        f = open("moves"+str(round)+".csv", "w")
        for currentScore in range(45):
            for totalScore in range(45):
                move = m.getMove([currentScore, round, totalScore, 0])
                if move[g.kGoIndex] > move[g.kEndIndex]:
                    f.write("1,")
                else:
                    f.write("0,")
            f.write("\n")
            f.flush()
        f.close()


if __name__ == "__main__":
    main()
