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

    m = ModelStrategy(g)

    runner.collectWinData(g, s, trainingStates, trainingMoves)
    for _ in range(10):
        history = m.train(trainingStates, trainingMoves)
        trainingStates = []
        trainingMoves = []
        # add some training states from the model.
        runner.collectWinData(g, m, trainingStates, trainingMoves)
        # add some training states from the strategy.
        runner.collectWinData(g, s, trainingStates, trainingMoves)
    SaveDecisionMatrix(g, m)


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
