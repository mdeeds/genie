import random

import numpy as np


class OneDie:
    kGoIndex = 0
    kEndIndex = 1

    kScoreIndex = 0
    kRoundIndex = 1
    kTotalScore = 2

    roundCount = 5
    winningScore = 25

    def getInitialState(self):
        return np.zeros(self.getStateSize())

    # [ current score, current round, totalScore]
    def getStateSize(self):
        return 3

    # There are two possible moves: go or end round.
    def getMoveSize(self):
        return 2

    def getDieRoll(self):
        return random.randrange(1, 7)

    def applyMove(self, state, move,):
        newState = state.copy()
        if move[self.kGoIndex] > move[self.kEndIndex]:
            # "GO" move
            newRoll = self.getDieRoll()
            if (newRoll == 1):
                newState[OneDie.kScoreIndex] = 0
                newState[OneDie.kRoundIndex] += 1
            else:
                newState[OneDie.kScoreIndex] += newRoll
        else:
            # "End" move
            newState[OneDie.kTotalScore] += newState[OneDie.kScoreIndex]
            newState[OneDie.kRoundIndex] += 1
            newState[OneDie.kScoreIndex] = 0
        return newState

    def isWinning(self, state):
        isLastRound = state[OneDie.kRoundIndex] == OneDie.roundCount
        scoreIsWinning = state[OneDie.kTotalScore] >= OneDie.winningScore
        return isLastRound and scoreIsWinning

    def isLosing(self, state):
        isLastRound = state[OneDie.kRoundIndex] == OneDie.roundCount
        scoreIsWinning = state[OneDie.kTotalScore] >= OneDie.winningScore
        return isLastRound and not scoreIsWinning
