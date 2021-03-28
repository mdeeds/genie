export class VMap<T> {
  private map: Map<string, T>;
  private states: Map<string, Float32Array>;
  constructor() {
    this.map = new Map<string, T>();
    this.states = new Map<string, Float32Array>();
  }

  has(state: Float32Array): boolean {
    return this.map.has(state.toString());
  }

  get(state: Float32Array): T {
    return this.map.get(state.toString());
  }

  set(state: Float32Array, v: T) {
    const key = state.toString();
    this.map.set(key, v);
    this.states.set(key, state);
  }

  size() {
    return this.map.size;
  }

  stringKeys() {
    return this.map.keys();
  }

  entries(): [Float32Array, T][] {
    const kvs: [Float32Array, T][] = [];
    for (const k of this.map.keys()) {
      kvs.push([this.states.get(k), this.map.get(k)]);
    }
    return kvs;
  }
}