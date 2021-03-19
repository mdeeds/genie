import { Game } from "./game";
import { Move } from "./move";
import { State } from "./state";

export class TicTacToe implements Game {
  getPlayerCount() {
    return 2;
  }

  getStateSize() {
    return 18;
  }

  getInitialState() {
    return new State(this.getStateSize(), 0, this.getPlayerCount());
  }

  getMoveSize() {
    return 9;
  }

  private getLargestIndex(move: Move) {
    let largestValue = move.data[0];
    let largestIndex = 0;
    for (let i = 1; i < move.data.length; ++i) {
      if (move.data[i] > largestValue) {
        largestValue = move.data[i];
        largestIndex = i;
      }
    }
    return largestIndex;
  }

  private copyState(source: Float32Array, destination: Float32Array) {
    for (let i = 0; i < this.getStateSize(); ++i) {
      destination[i] = source[i];
    }
  }

  private checkForWin(offset: number, stateData: Float32Array) {
    for (let i = 0; i < 3; ++i) {
      let numInRow = 0;
      let numInCol = 0;
      for (let j = 0; j < 3; ++j) {
        numInRow += stateData[offset + i + j * 3];
        numInCol += stateData[offset + j + i * 3];
      }
      if (numInRow > 2.5 || numInCol > 2.5) {
        return true;
      }
    }
    if (stateData[offset] +
      stateData[offset + 4] +
      stateData[offset + 8] > 2.5) {
      return true;
    }
    if (stateData[offset + 2] +
      stateData[offset + 4] +
      stateData[offset + 6] > 2.5) {
      return true;
    }
    return false;
  }

  applyMove(state: State, move: Move): State {
    const offset = 9 * state.playerIndex;
    const i = this.getLargestIndex(move);
    const nextPlayer = 1 - state.playerIndex;
    const nextState = state.clone();
    if (state.data[i] > 0.5 || state.data[i + 9] > 0.5) {
      // It is illegal to play on a square that already has an X or O.
      // This results in an immediate game over.
      nextState.ended = true;
      nextState.forfeit = true;
      nextState.winners[nextPlayer] = 1.0;
      return nextState;
    }
    nextState.data[offset + i] = 1.0;
    if (this.checkForWin(offset, nextState.data)) {
      nextState.winners[state.playerIndex] = 1.0;
      nextState.ended = true;
    } else {
      nextState.playerIndex = nextPlayer;
    }
    let moveCount = 0;
    for (const c of state.data) {
      moveCount += c;
    }
    if (moveCount === 9) {
      nextState.ended = true;
      nextState.forfeit = false;
    }
    return nextState;
  }
}