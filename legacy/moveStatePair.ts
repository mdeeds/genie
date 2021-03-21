import { Move } from "./move";
import { State } from "./state";

export class MoveStatePair {
  state: State;
  move: Move;
  constructor(move: Move, state: State) {
    this.state = state;
    this.move = move;
  }
}