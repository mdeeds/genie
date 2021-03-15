import { Estimator } from "./estimator";
import { Game } from "./game";
import { RandomStrategy } from "./randomStrategy";
import { RunGame } from "./runGame";
import { State } from "./state";
import { Strategy } from "./strategy";

export class MonteCarloEstimator implements Estimator {
  private playerCount: number;
  private game: Game;
  private strategy: Strategy;
  private runner: RunGame;

  constructor(game: Game) {
    this.game = game;
    this.playerCount = game.getPlayerCount();
    this.strategy = new RandomStrategy(game);
    this.runner = new RunGame();
  }

  private addScaledVector(target: Float32Array, scalar: number, source: Float32Array) {
    for (let i = 0; i < target.length; ++i) {
      target[i] += scalar * source[i];
    }
  }

  private probabilityOfWinOneState(state: State): Float32Array {
    const numGames = 300;
    const strategies: Strategy[] = [];
    while (strategies.length < this.playerCount) {
      strategies.push(this.strategy);
    }
    const states: State[] = [];
    const wins: Float32Array[] = [];
    this.runner.collectWinData(this.game, strategies, states, wins, numGames);
    let winRates = new Float32Array(this.playerCount);
    for (let i = 0; i < states.length; ++i) {
      const s = states[i];
      if (s.isEnded()) {
        this.addScaledVector(winRates, 1 / numGames, wins[i])
      }
    }
    return winRates;
  }

  probabilityOfWin(state: State[]): Float32Array[] {
    const result: Float32Array[] = [];
    for (const s of state) {
      result.push(this.probabilityOfWinOneState(s));
    }
    return result;
  }
}