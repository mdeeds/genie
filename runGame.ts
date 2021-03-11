import { Game } from "./game";
import { Move } from "./move";
import { Snacks } from "./snacks";
import { State } from "./state";
import { Strategy } from "./strategy";

export class RunGame {
  private snacks: Snacks;
  constructor() {
    this.snacks = new Snacks();
  }

  private oneHotMove(move: Move) {
    let maxValue = -1000;
    let maxIndex = 0;
    const result = new Move(move.data.length);
    for (let i = 0; i < move.data.length; ++i) {
      result[i] = (0.1 / (move.data.length - 1));
      if (move.data[i] > maxValue) {
        maxValue = move.data[i];
        maxIndex = i;
      }
    }
    result.data[maxIndex] = 0.9;
    return result;
  }

  // Runs the game, returns the player number who won or -1 if there is
  // no winner.
  private run(game: Game, strategies: Strategy[]): number {
    const states: State[][] = [];
    const moves: Move[][] = [];
    while (states.length < game.getPlayerCount()) {
      states.push([]);
      moves.push([]);
    }

    console.assert(game.getPlayerCount() === strategies.length);
    let state = game.getInitialState();
    let currentPlayer = 0;
    while (!state.isEnded()) {
      const move = strategies[currentPlayer].getMove(state);
      states[currentPlayer].push(state);
      moves[currentPlayer].push(this.oneHotMove(move));
      state = game.applyMove(state, move);
      currentPlayer = (currentPlayer + 1) % game.getPlayerCount();
    }
    const winner = state.winner;
    return winner;
  }

  collectWinData(game: Game, strategies: Strategy[]) {
    const startTime = window.performance.now();
    let winCount = 0;
    const gameCount = 1000;
    for (let i = 0; i < gameCount; ++i) {
      const winner = this.run(game, strategies);
      if (winner >= 0) {
        ++winCount;
      }
    }
    const elapsedSeconds = (window.performance.now() - startTime) / 1000;
    console.log(`Running time: ${elapsedSeconds}`)
    return winCount / gameCount;
  }

  getSnacks() {
    return this.snacks;
  }
}