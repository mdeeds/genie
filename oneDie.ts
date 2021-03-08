import { Game } from "./game";

export class OneDie implements Game {
  static kGoIndex = 0;
  static kEndIndex = 1;

  static kScoreIndex = 0;
  static kRoundIndex = 1;
  static kTotalScore = 2;
  static kStatePerPlayer = 3;

  private roundCount: number;
  private winningScore: number;
  private numberOfPlayers: number;

  constructor(roundCount = 5, winningScore = 25, numberOfPlayers = 1) {
    this.roundCount = roundCount;
    this.winningScore = winningScore;
    this.numberOfPlayers = numberOfPlayers;
  }

  getInitialState() {
    return new Float32Array(OneDie.kStatePerPlayer * this.numberOfPlayers);
  }

  // [ current score, current round, totalScore]
  getStateSize() {
    return OneDie.kStatePerPlayer * this.numberOfPlayers;
  }

  // There are two possible moves: go or end round.
  getMoveSize() {
    return 2;
  }

  private getDieRoll() {
    return 1 + Math.trunc(Math.random() * 6);
  }

  applyMove(state: Float32Array, move: Float32Array): Float32Array {
    const newState: Float32Array = state.slice(0, OneDie.kStatePerPlayer);
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

    // Result state is shifted by one player to the left.  The next active
    // player is placed at the front, and the current player is placed at the
    // end.
    const resultState = new Float32Array(this.getStateSize());
    const otherPlayerStateSize =
      (this.numberOfPlayers - 1) * OneDie.kStatePerPlayer;
    for (let i = 0; i < otherPlayerStateSize; ++i) {
      resultState[i] = state[i + OneDie.kStatePerPlayer];
    }
    for (let i = 0; i < OneDie.kStatePerPlayer; ++i) {
      resultState[i + otherPlayerStateSize] = newState[i];
    }
    return resultState;
  }

  private isWinningAtOffset(state: Float32Array, offset: number) {
    return (state[OneDie.kRoundIndex + offset] == this.roundCount &&
      state[OneDie.kTotalScore + offset] >= this.winningScore);
  }

  isWinning(state: Float32Array) {
    return this.isWinningAtOffset(state, 0);
  }
  isLosing(state: Float32Array) {
    // If we are winning, we are not losing.
    if (this.isWinningAtOffset(state, 0)) {
      return false;
    }
    // If someone else has won, we have lost.
    for (let i = 1; i < this.numberOfPlayers; ++i) {
      if (this.isWinningAtOffset(state, i * OneDie.kStatePerPlayer)) {
        return true;
      }
    }
    // Otherwise, we can lose if all rounds are used.
    return (state[OneDie.kRoundIndex] == this.roundCount);
  }
}
