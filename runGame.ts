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
  private run(game: Game, strategies: Strategy[],
    outStates: State[], outWinProb: Float32Array[]): void {
    const states: State[] = [];

    console.assert(game.getPlayerCount() === strategies.length);
    let state = game.getInitialState();
    while (!state.isEnded()) {
      const currentPlayer = state.playerIndex;
      const move = strategies[currentPlayer].getMove(state);
      states.push(state);
      state = game.applyMove(state, move);
    }
    states.push(state);
    const winners = state.winners;
    for (const s of states) {
      outStates.push(s);
      outWinProb.push(winners);
    }
  }

  // outWinProb will be populated with indicators (0 for loss, 1 for win)
  // for the players in the game.
  collectWinData(game: Game, strategies: Strategy[],
    outStates: State[], outWinProb: Float32Array[], gameCount: number): void {
    for (let i = 0; i < gameCount; ++i) {
      this.run(game, strategies, outStates, outWinProb);
    }
  }

  getSnacks() {
    return this.snacks;
  }
}