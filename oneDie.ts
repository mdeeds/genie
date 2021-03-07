import { Game } from "./game";

export class OneDie implements Game {
  static kGoIndex = 0;
  static kEndIndex = 1;

  static kScoreIndex = 0;
  static kRoundIndex = 1;
  static kTotalScore = 2;

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
    return 3;
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
    if (move[OneDie.kGoIndex] > move[OneDie.kEndIndex]) {
      // "GO" move
      const newRoll = this.getDieRoll();
      if (newRoll === 1) {
        newState[OneDie.kScoreIndex] = 0;
        newState[OneDie.kRoundIndex] += 1;
      } else {
        newState[OneDie.kScoreIndex] += newRoll;
      }
    } else {
      // "End" move
      newState[OneDie.kTotalScore] += newState[OneDie.kScoreIndex];
      newState[OneDie.kRoundIndex] += 1;
      newState[OneDie.kScoreIndex] = 0;
    }
    return newState;
  }

  isWinning(state: Float32Array) {
    return (state[OneDie.kRoundIndex] == this.roundCount &&
      state[OneDie.kTotalScore] >= this.winningScore);
  }
  isLosing(state: Float32Array) {
    return (state[OneDie.kRoundIndex] == this.roundCount &&
      state[OneDie.kTotalScore] < this.winningScore);
  }
}
