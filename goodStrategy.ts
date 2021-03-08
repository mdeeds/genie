import { Strategy } from "./strategy";
import { OneDie } from "./oneDie";

export class GoodStrategy implements Strategy {
  private game: OneDie;
  constructor(game: OneDie) {
    this.game = game;
  }

  getMove(state: Float32Array): Float32Array {
    const move = new Float32Array(this.game.getMoveSize());
    if (state[OneDie.kScoreIndex] >= 12 || state[OneDie.kTotalScore] > 25) {
      move[OneDie.kEndIndex] = 1.0;
    } else {
      move[OneDie.kGoIndex] = 1.0;
    }
    return move;
  }
}