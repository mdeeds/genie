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

  private probabilityOfWinOneState(state: State): number[] {
    const numGames = 300;
    const strategies: Strategy[] = [];
    while (strategies.length < this.playerCount) {
      strategies.push(this.strategy);
    }
    const states: State[] = [];
    const wins: number[][] = [];
    this.runner.collectWinData(this.game, strategies, states, wins, numGames);
    let winRates = [];
    while (winRates.length < this.playerCount) {
      winRates.push(0);
    }
    for (const s of states) {
      if (s.isEnded() && s.winner < this.playerCount) {
        winRates[s.winner] += 1 / numGames;
      }
    }
    return winRates;
  }

  probabilityOfWin(state: State[]): number[][] {
    const result: number[][] = [];
    for (const s of state) {
      result.push(this.probabilityOfWinOneState(s));
    }
    return result;
  }
}