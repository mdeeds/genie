import { Estimator } from "./estimator";
import { Game } from "./game";
import { State } from "./state";

export class RandomEstimator implements Estimator {
  private playerCount: number;
  constructor(game: Game) {
    this.playerCount = game.getPlayerCount();
  }
  probabilityOfWin(state: State[]): Float32Array[] {
    const result: Float32Array[] = [];
    for (let i = 0; i < state.length; ++i) {
      result.push(new Float32Array(this.playerCount));
      for (let j = 0; j < this.playerCount; ++j) {
        result[i][j] = Math.random();
      }
    }
    return result;
  }
}