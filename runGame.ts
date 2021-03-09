import { Game } from "./game";
import { Strategy } from "./strategy";

export class RunGame {
  constructor() {
  }

  private oneHotMove(move: Float32Array) {
    let maxValue = -1000;
    let maxIndex = 0;
    const result = new Float32Array(move.length);
    for (let i = 0; i < move.length; ++i) {
      result[i] = 0.1;
      if (move[i] > maxValue) {
        maxValue = move[i];
        maxIndex = i;
      }
    }
    result[maxIndex] = 0.9;
    return result;
  }

  // Runs the game, returns the player number who won or -1 if there is
  // no winner.
  private run(game: Game, strategies: Strategy[],
    outStates: Float32Array[], outMoves: Float32Array[]): number {

    const states: Float32Array[][] = [];
    const moves: Float32Array[][] = [];
    while (states.length < game.getPlayerCount()) {
      states.push([]);
      moves.push([]);
    }

    console.assert(game.getPlayerCount() === strategies.length);
    let state = game.getInitialState();
    let currentPlayer = 0;
    while (!game.isEnded(state)) {
      const move = strategies[currentPlayer].getMove(state);
      states[currentPlayer].push(state);
      moves[currentPlayer].push(this.oneHotMove(move));
      state = game.applyMove(state, move);
      currentPlayer = (currentPlayer + 1) % game.getPlayerCount();
    }
    const winner = game.getWinner(state);
    if (winner >= 0) {
      for (const s of states[winner]) {
        outStates.push(s);
      }
      for (const m of moves[winner]) {
        outMoves.push(m);
      }
    }
    return winner;
  }

  collectWinData(game: Game, strategies: Strategy[],
    winningStates: Float32Array[], winningMoves: Float32Array[]) {
    const startTime = window.performance.now();
    let winCount = 0;
    const gameCount = 1000;
    for (let i = 0; i < gameCount; ++i) {
      const winner = this.run(game, strategies, winningStates, winningMoves);
      if (winner >= 0) {
        ++winCount;
      }
    }
    const elapsedSeconds = (window.performance.now() - startTime) / 1000;
    console.log(`Running time: ${elapsedSeconds}`)
    return winCount / gameCount;
  }
}