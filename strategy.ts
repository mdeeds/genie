import { Move } from "./move";
import { State } from "./state";

export interface Strategy {
  getMove(state: State): Move;
}