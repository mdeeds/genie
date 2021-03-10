import { Game } from "./game";
import { Move } from "./move";
import { State } from "./state";

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

  // [ current player state..., next player state...., ,]
  getStateSize() {
    return OneDie.kStatePerPlayer * this.numberOfPlayers;
  }

  getInitialState() {
    return new State(this.getStateSize(), 0);
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

  applyMove(state: State, move: Move): State {
    const newState: Float32Array = state.data.slice(0, OneDie.kStatePerPlayer);
    // Moves only happen if rounds are remaining.
    if (state.data[OneDie.kRoundIndex] < this.roundCount) {
      if (move.data[OneDie.kGoIndex] > move.data[OneDie.kEndIndex]) {
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
    const currentPlayer = state.playerIndex;
    const nextPlayer = (currentPlayer + 1) % this.numberOfPlayers;
    const resultState = new State(this.getStateSize(), nextPlayer);
    const otherPlayerStateSize =
      (this.numberOfPlayers - 1) * OneDie.kStatePerPlayer;
    for (let i = 0; i < otherPlayerStateSize; ++i) {
      resultState.data[i] = state.data[i + OneDie.kStatePerPlayer];
    }
    for (let i = 0; i < OneDie.kStatePerPlayer; ++i) {
      resultState.data[i + otherPlayerStateSize] = newState[i];
    }
    return resultState;
  }

  private isWinningAtOffset(state: State, offset: number) {
    return (state.data[OneDie.kRoundIndex + offset] == this.roundCount &&
      state.data[OneDie.kTotalScore + offset] >= this.winningScore);
  }

  getWinner(state: State) {
    for (let i = 0; i < this.numberOfPlayers; ++i) {
      if (this.isWinningAtOffset(state, i * OneDie.kStatePerPlayer)) {
        return i;
      }
    }
    return -1;
  }
  isEnded(state: State) {
    let ended = true;
    for (let i = 0; i < this.numberOfPlayers; ++i) {
      if (state.data[OneDie.kRoundIndex + i * OneDie.kStatePerPlayer]
        < this.roundCount) {
        ended = false;
      }
    }
    return ended;
  }
}
