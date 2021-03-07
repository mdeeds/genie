import { Stats } from "fs";
import { Game } from "./game";
import { Strategy } from "./strategy";

export class RunGame {
  constructor() {
  }

  run(game: Game, strategy: Strategy,
    states: Float32Array[], moves: Float32Array[]) {
    let state = game.getInitialState();
    while (!game.isWinning(state) && !game.isLosing(state)) {
      const move = strategy.getMove(state);
      states.push(state);
      moves.push(move);
      state = game.applyMove(state, move);
    }
    return game.isWinning(state);
  }

  collectWinData(game: Game, strategy: Strategy,
    winningStates: Float32Array[], winningMoves: Float32Array[]) {
    let winCount = 0;
    const gameCount = 200;
    for (let i = 0; i < gameCount; ++i) {
      const states: Float32Array[] = [];
      const moves: Float32Array[] = [];
      const isWin = this.run(game, strategy, states, moves);
      if (isWin) {
        winningStates.push(...states);
        winningMoves.push(...moves);
        ++winCount;
      }
    }
    console.log(`Win rate: ${(winCount / gameCount).toFixed(3)}`);
    return winCount / gameCount;
  }
}