import { State } from "./state";

export interface Estimator {
  // Returns probabilities of winning for each state.
  // For each state returns one probability for each player.s
  probabilityOfWin(state: State[]): Float32Array[];
}