import random

import numpy as np

from oneDie import OneDie


class GoodStrategy:
    game = None

    def __init__(self, g):
        self.game = g

    def getMove(self, state):
        move = np.zeros(self.game.getMoveSize())
        # if (state[OneDie.kScoreIndex] >= 5 or state[OneDie.kTotalScore] > 25):
        # if (state[OneDie.kScoreIndex] >= 12 or state[OneDie.kTotalScore] > 25):
        if random.random() > 0.5:
            move[OneDie.kEndIndex] = 1.0
        else:
            move[OneDie.kGoIndex] = 1.0
        return move
