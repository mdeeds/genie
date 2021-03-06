import { Game } from "./game";

export class OneDie implements Game {
  private kGoIndex = 0;
  private kEndIndex = 1;

  private kScoreIndex = 0;
  private kRoundIndex = 1;
  private kTotalScore = 2;

  private roundCount: number;
  private winningScore: number;
  constructor(roundCount = 5, winningScore = 25) {
    this.roundCount = roundCount;
    this.winningScore = winningScore;
  }

  getInitialState() {
    return new Float32Array(3);
  }

  // [ current score, current round, totalScore]
  getStateSize() {
    return 4;
  }

  // There are two possible moves: go or end round.
  getMoveSize() {
    return 2;
  }

  private getDieRoll() {
    return 1 + Math.trunc(Math.random() * 6);
  }

  applyMove(state: Float32Array, move: Float32Array): Float32Array {
    const newState = new Float32Array(state);
    if (move[this.kGoIndex] > move[this.kEndIndex]) {
      // "GO" move
      const newRoll = this.getDieRoll();
      if (newRoll === 1) {
        newState[this.kScoreIndex] = 0;
        newState[this.kRoundIndex] += 1;
      } else {
        newState[this.kScoreIndex] += newRoll;
      }
    } else {
      // "End" move
      newState[this.kTotalScore] += newState[this.kScoreIndex];
      newState[this.kRoundIndex] += 1;
      newState[this.kScoreIndex] = 0;
    }
    return newState;
  }

  isWinning(state: Float32Array) {
    return (state[this.kRoundIndex] == this.roundCount &&
      state[this.kTotalScore] >= this.winningScore);
  }
  isLosing(state: Float32Array) {
    return (state[this.kRoundIndex] == this.roundCount &&
      state[this.kTotalScore] < this.winningScore);
  }
}
