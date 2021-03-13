import { Game } from "./game";
import { Move } from "./move";
import { State } from "./state";

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
    return new State(this.getStateSize(), 0);
  }

  // [ current score, current round, totalScore]
  getStateSize() {
    return 3;
  }

  // There are two possible moves: go or end round.
  getMoveSize() {
    return 2;
  }

  getPlayerCount() {
    return 1;
  }

  private getDieRoll() {
    return 1 + Math.trunc(Math.random() * 6);
  }

  applyMove(state: State, move: Move): State {
    const newState = state.clone();
    if (move.data[OneDie.kGoIndex] > move.data[OneDie.kEndIndex]) {
      // "GO" move
      const newRoll = this.getDieRoll();
      if (newRoll === 1) {
        newState.data[OneDie.kScoreIndex] = 0;
        newState.data[OneDie.kRoundIndex] += 1;
      } else {
        newState.data[OneDie.kScoreIndex] += newRoll;
      }
    } else {
      // "End" move
      newState.data[OneDie.kTotalScore] += newState.data[OneDie.kScoreIndex];
      newState.data[OneDie.kRoundIndex] += 1;
      newState.data[OneDie.kScoreIndex] = 0;
    }
    if (newState.data[OneDie.kRoundIndex] === this.roundCount) {
      if (newState.data[OneDie.kTotalScore] >= this.winningScore) {
        newState.winner = 0;
      } else {
        newState.winner = 1;
      }
    }
    return newState;
  }
}
