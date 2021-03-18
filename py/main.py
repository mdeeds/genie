from goodStrategy import GoodStrategy
from randomStrategy import RandomStrategy
from modelStrategy import ModelStrategy
from oneDie import OneDie
from ticTacToe import TicTacToe
from runGame import RunGame
from gamePairs import GamePairs
import time


def main():
    g = TicTacToe()
    s = RandomStrategy(g)
    m = ModelStrategy(g)
    m.load("best.hdf5")

    # print("Starting.")

    runner = RunGame()
    trainingPairs = GamePairs()

    bestModel = None
    bestModelRate = -1
    runner.kMinWins = 1E6
    runner.kMinGames = 1E8

    startTime = time.perf_counter()
    runner.collectWinData(g, [m, s], trainingPairs)
    stopTime = time.perf_counter()
    print(stopTime-startTime)

    print("Collected " + str(trainingPairs.len()) + " moves.")
    averageWinRate = trainingPairs.averageWinRate()
    averageConfidence = trainingPairs.averageConfidence()
    # f = open("rates.csv", "w")
    # for pair in trainingPairs.pairs.values():
    #     f.write(str(pair.getWinRatio())+"," +
    #             str(pair.wins)+","+str(pair.losses)+"\n")
    # f.close()
    # for threshold in range(1, 30):
    trainingStates, trainingMoves = trainingPairs.getBest(0.5, 0.5)
    print("using " + str(len(trainingStates)) + " moves")
    m.train(trainingStates, trainingMoves)
    runner.kMinWins = 1E2
    runner.kMinGames = 1E3
    mrate = runner.collectWinData(g, [m, s], trainingPairs)
    # if mrate > bestModelRate:
    #     bestModel = m
    # bestModel.save("best.hdf5")
#     SaveDecisionMatrix(g, bestModel)


# def SaveDecisionMatrix(g, m):
#     for round in range(5):
#         f = open("moves"+str(round)+".csv", "w")
#         for currentScore in range(45):
#             for totalScore in range(45):
#                 move = m.getMove([currentScore, round, totalScore, 0])
#                 if move[g.kGoIndex] > move[g.kEndIndex]:
#                     f.write("1,")
#                 else:
#                     f.write("0,")
#             f.write("\n")
#             f.flush()
#         f.close()


if __name__ == "__main__":
    main()
