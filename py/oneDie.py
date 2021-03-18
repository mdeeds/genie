import random

import numpy as np


class OneDie:
    kGoIndex = 0
    kEndIndex = 1

    kScoreIndex = 0
    kRoundIndex = 1
    kTotalScore = 2
    kStatePerPlayer = 3

    numberOfPlayers = 1
    roundCount = 5
    winningScore = 25

    def __init__(self, numberOfPlayers=1, roundCount=5, winningScore=25):
        self.numberOfPlayers = numberOfPlayers
        self.roundCount = roundCount
        self.winningScore = winningScore

    def getInitialState(self):
        return np.zeros(self.getStateSize())

    def getPlayerCount(self):
        return self.numberOfPlayers

    def getPossibleStates(self):
        states = []
        for currentScore in range(self.winningScore):
            for currentRound in range(self.roundCount):
                for totalScore in range(self.winningScore):
                    states.append([currentScore, currentRound, totalScore, 0])
        return states

    # [ current score, current round, totalScore]
    def getStateSize(self):
        return OneDie.kStatePerPlayer * self.numberOfPlayers + 1

    def getPlayerCount(self):
        return self.numberOfPlayers

    # There are two possible moves: go or end round.
    def getMoveSize(self):
        return 2

    def getDieRoll(self):
        return random.randrange(1, 7)

    def applyMove(self, state, move,):
        newState = state.copy()
        if state[OneDie.kRoundIndex] < self.roundCount:
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
        # Result state is shifted by one player to the left.  The next active
        # player is placed at the front, and the current player is placed at the
        # end.
        resultState = np.zeros(self.getStateSize())
        otherPlayerStateSize = (self.numberOfPlayers -
                                1) * OneDie.kStatePerPlayer
        for i in range(otherPlayerStateSize):
            resultState[i] = state[i + OneDie.kStatePerPlayer]
        for i in range(OneDie.kStatePerPlayer):
            resultState[i + otherPlayerStateSize] = newState[i]

        currentPlayer = state[len(state) - 1]
        nextPlayer = (currentPlayer + 1) % self.numberOfPlayers
        state[len(state) - 1] = nextPlayer

        return resultState

    def isWinning(self, state, offset=0):
        isLastRound = state[OneDie.kRoundIndex + offset] == OneDie.roundCount
        scoreIsWinning = state[OneDie.kTotalScore +
                               offset] >= OneDie.winningScore
        return isLastRound and scoreIsWinning

    def isLosing(self, state, offset=0):
        isLastRound = state[OneDie.kRoundIndex + offset] == OneDie.roundCount
        scoreIsWinning = state[OneDie.kTotalScore +
                               offset] >= OneDie.winningScore
        return isLastRound and not scoreIsWinning

    def getWinner(self, state):
        for i in range(self.numberOfPlayers):
            if self.isWinning(state, i * OneDie.kStatePerPlayer):
                return i
        return -1

    def isEnded(self, state):
        ended = True
        for i in range(self.numberOfPlayers):
            if (state[OneDie.kRoundIndex + i * OneDie.kStatePerPlayer] < self.roundCount):
                ended = False
        return ended
