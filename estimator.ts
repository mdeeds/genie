import { State } from "./state";

export interface Estimator {
  probabilityOfWin(state: State[]): number[];
}