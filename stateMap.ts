import { State } from "./state";

export class StateMap<T> {
  private map: Map<string, T>;
  constructor() {
    this.map = new Map<string, T>();
  }

  has(state: State): boolean {
    return this.map.has(state.toString());
  }

  get(state: State): T {
    return this.map.get(state.toString());
  }

  set(state: State, v: T) {
    this.map.set(state.toString(), v);
  }

  size() {
    return this.map.size;
  }

  stringKeys() {
    return this.map.keys();
  }
}