import { Estimator } from "./estimator";
import { State } from "./state";

export class DumbEstimator implements Estimator {
  probabilityOfWin(state: State[]): number[] {
    const result: number[] = [];
    while (result.length < state.length) {
      result.push(0.5);
    }
    return result;
  }
}