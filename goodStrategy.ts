import { Strategy } from "./strategy";
import { OneDie } from "./oneDie";

export class GoodStrategy implements Strategy {
  constructor() { }

  getMove(state: Float32Array): Float32Array {
    const move = new Float32Array(2);
    if (state[OneDie.kScoreIndex] >= 5 || state[OneDie.kTotalScore] > 25) {
      move[OneDie.kEndIndex] = 1.0;
    } else {
      move[OneDie.kGoIndex] = 1.0;
    }
    return move;
  }
}