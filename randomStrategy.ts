import { Game } from "./game";
import { Move } from "./move";
import { State } from "./state";
import { Strategy } from "./strategy";

export class RandomStrategy implements Strategy {
  private moveSize: number;
  constructor(g: Game) {
    this.moveSize = g.getMoveSize();
  }

  getMove(state: State): Move {
    const move = new Move(this.moveSize);
    const moveNumber = Math.trunc(Math.random() * this.moveSize);
    move.data[moveNumber] = 1.0;
    return move;
  }
}