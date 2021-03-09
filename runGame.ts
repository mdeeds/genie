import { Game } from "./game";
import { Strategy } from "./strategy";

export class RunGame {
  constructor() {
  }

  private oneHotMove(move: Float32Array) {
    let maxValue = -1000;
    let maxIndex = 0;
    for (let i = 0; i < move.length; ++i) {
      if (move[i] > maxValue) {
        maxValue = move[i];
        maxIndex = i;
      }
    }
    const result = new Float32Array(move.length);
    result[maxIndex] = 1.0;
    return result;
  }

  run(game: Game, strategy: Strategy,
    states: Float32Array[], moves: Float32Array[]) {
    let state = game.getInitialState();
    while (!game.isWinning(state) && !game.isLosing(state)) {
      const move = strategy.getMove(state);
      states.push(state);
      moves.push(this.oneHotMove(move));
      state = game.applyMove(state, move);
    }
    return game.isWinning(state);
  }

  collectWinData(game: Game, strategy: Strategy,
    winningStates: Float32Array[], winningMoves: Float32Array[]) {
    const startTime = window.performance.now();
    let winCount = 0;
    const gameCount = 1000;
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
    const elapsedSeconds = (window.performance.now() - startTime) / 1000;
    console.log(`Running time: ${elapsedSeconds}`)
    return winCount / gameCount;
  }
}