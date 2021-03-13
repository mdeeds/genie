import { Estimator } from "./estimator";
import { Game } from "./game";
import { State } from "./state";

export class DumbEstimator implements Estimator {
  private playerCount: number;
  constructor(game: Game) {
    this.playerCount = game.getPlayerCount();
  }
  probabilityOfWin(state: State[]): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < state.length; ++i) {
      result.push([]);
      for (let j = 0; j < this.playerCount; ++j) {
        result[i].push(0.5)
      }
    }
    return result;
  }
}