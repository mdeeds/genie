import numpy as np


class GamePair:
    state = []
    move = []
    wins = 0
    losses = 0

    def __init__(self, state, move, isWin):
        self.state = np.array(state)
        self.move = np.array(move)
        if isWin:
            self.wins = 1
        else:
            self.losses = 1

    def getWinRatio(self):
        ratio = float(1+self.wins)/float(2+self.losses+self.wins)
        return ratio

    def getConfidence(self):
        confidence = 1.0-(1.0/(self.wins + self.losses))
        return confidence


def hash(state, move):
    return str(state)+str(move)


class GamePairs:
    pairs = dict()

    def getBest(self, winThreshold, confidenceThreshold=0.0):
        best = [x for x in self.pairs.values() if x.getWinRatio(
        ) > winThreshold and x.getConfidence() > confidenceThreshold]
        bestStates = []
        bestMoves = []
        for item in best:
            for _ in range(item.wins):
                bestStates.append(item.state)
                bestMoves.append(item.move)

        return bestStates, bestMoves

    def len(self):
        return len(self.pairs)

    def averageWinRate(self):
        average = 0
        for pair in self.pairs.values():
            average += pair.getWinRatio()
        average /= self.len()
        return average

    def averageConfidence(self):
        average = 0
        for pair in self.pairs.values():
            average += pair.getConfidence()
        average /= self.len()
        return average

    def append(self, state, move, isWin):
        key = hash(state, move)
        if key in self.pairs:
            if isWin:
                self.pairs[key].wins += 1
            else:
                self.pairs[key].losses += 1
        else:
            gp = GamePair(state, move, isWin)
            self.pairs[hash(state, move)] = gp

        # gp = GamePair(state, move, isWin)
        # self.pairs.append(gp)
