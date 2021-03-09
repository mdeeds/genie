from goodStrategy import GoodStrategy
from modelStrategy import ModelStrategy
from oneDie import OneDie
from runGame import RunGame


def main():
    g = OneDie()
    s = GoodStrategy()

    print("Starting.")

    runner = RunGame()
    trainingStates = []
    trainingMoves = []
    runner.collectWinData(g, s, trainingStates, trainingMoves)

    print("Collected " + str(len(trainingMoves)) + " moves.")

    m1 = ModelStrategy(g)
    m2 = ModelStrategy(g)
    m3 = ModelStrategy(g)

    bestModel = None
    bestModelRate = 0
    runner.collectWinData(g, s, trainingStates, trainingMoves)
    for _ in range(50):
        m1.train(trainingStates, trainingMoves)
        m2.train(trainingStates, trainingMoves)
        m3.train(trainingStates, trainingMoves)
        trainingStates = trainingStates[-1000:]
        trainingMoves = trainingMoves[-1000:]
        # add some training states from the model.
        m1rate = runner.collectWinData(g, m1, trainingStates, trainingMoves)
        m2rate = runner.collectWinData(g, m2, trainingStates, trainingMoves)
        m3rate = runner.collectWinData(g, m3, trainingStates, trainingMoves)

        maxRate = max(m1rate, m2rate, m3rate, bestModelRate)
        if m1rate == maxRate:
            bestModel = m1
            bestModelRate = m1rate
        if m2rate == maxRate:
            bestModel = m2
            bestModelRate = m2rate
        if m3rate == maxRate:
            bestModel = m3
            bestModelRate = m2rate
        m1 = bestModel
        m2 = bestModel
        m3 = ModelStrategy(g)
        # add some training states from the strategy.
        runner.collectWinData(g, s, trainingStates, trainingMoves)
    SaveDecisionMatrix(g, bestModel)
    runner.collectWinData(g, bestModel, trainingStates, trainingMoves)
    runner.collectWinData(g, bestModel, trainingStates, trainingMoves)
    runner.collectWinData(g, bestModel, trainingStates, trainingMoves)
    runner.collectWinData(g, bestModel, trainingStates, trainingMoves)
    runner.collectWinData(g, bestModel, trainingStates, trainingMoves)
    runner.collectWinData(g, bestModel, trainingStates, trainingMoves)
    runner.collectWinData(g, bestModel, trainingStates, trainingMoves)


def SaveDecisionMatrix(g, m):
    for round in range(5):
        f = open("moves"+str(round)+".csv", "w")
        for currentScore in range(45):
            for totalScore in range(45):
                move = m.getMove([currentScore, round, totalScore])
                if move[g.kGoIndex] > move[g.kEndIndex]:
                    f.write("1,")
                else:
                    f.write("0,")
            f.write("\n")
            f.flush()
        f.close()


if __name__ == "__main__":
    main()
