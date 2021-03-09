import { Game } from "./game";

export class OneDie implements Game {
  static kGoIndex = 0;
  static kEndIndex = 1;

  static kScoreIndex = 0;
  static kRoundIndex = 1;
  static kTotalScore = 2;
  static kStatePerPlayer = 3;

  private numberOfPlayers: number;
  private roundCount: number;
  private winningScore: number;

  constructor(numberOfPlayers = 1, roundCount = 5, winningScore = 25) {
    this.numberOfPlayers = numberOfPlayers;
    this.roundCount = roundCount;
    this.winningScore = winningScore;
  }

  // [ current player state..., next player state...., , player number]
  getStateSize() {
    return OneDie.kStatePerPlayer * this.numberOfPlayers + 1;
  }

  getInitialState() {
    return new Float32Array(this.getStateSize());
  }

  getPlayerCount() {
    return this.numberOfPlayers;
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
    // Moves only happen if rounds are remaining.
    if (state[OneDie.kRoundIndex] < this.roundCount) {
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

    const currentPlayer = state[state.length - 1];
    const nextPlayer = (currentPlayer + 1) % this.numberOfPlayers;
    state[state.length - 1] = nextPlayer;

    return resultState;
  }

  private isWinningAtOffset(state: Float32Array, offset: number) {
    return (state[OneDie.kRoundIndex + offset] == this.roundCount &&
      state[OneDie.kTotalScore + offset] >= this.winningScore);
  }

  getWinner(state: Float32Array) {
    for (let i = 0; i < this.numberOfPlayers; ++i) {
      if (this.isWinningAtOffset(state, i * OneDie.kStatePerPlayer)) {
        return i;
      }
    }
    return -1;
  }
  isEnded(state: Float32Array) {
    let ended = true;
    for (let i = 0; i < this.numberOfPlayers; ++i) {
      if (state[OneDie.kRoundIndex + i * OneDie.kStatePerPlayer]
        < this.roundCount) {
        ended = false;
      }
    }
    return ended;
  }
}
