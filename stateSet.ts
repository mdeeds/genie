import { State } from "./state";

export class StateSet {
  private set: Set<string>;
  constructor() {
    this.set = new Set<string>();
  }

  has(state: State): boolean {
    return this.set.has(state.toString());
  }

  add(state: State) {
    this.set.add(state.toString());
  }

  size() {
    return this.set.size;
  }
}