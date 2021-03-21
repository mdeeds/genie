import { State } from "./state";

export class StateSet {
  private set: Map<string, State>;
  constructor() {
    this.set = new Map<string, State>();
  }

  has(state: State): boolean {
    return this.set.has(state.toString());
  }

  add(state: State) {
    this.set.set(state.toString(), state);
  }

  values() {
    return this.set.values();
  }

  size() {
    return this.set.size;
  }

  delete(state: State) {
    this.set.delete(state.toString());
  }
}