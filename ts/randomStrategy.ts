import { Game } from "./game";
import { Strategy } from "./strategy";

export class RandomStrategy implements Strategy {
  private moveSize: number;
  constructor(g: Game) {
    this.moveSize = g.getMoveSize();
  }

  getMove(state: Float32Array): Float32Array {
    const move = new Float32Array(this.moveSize);
    const moveNumber = Math.trunc(Math.random() * this.moveSize);
    move[moveNumber] = 1.0;
    return move;
  }
}