export class State {
  static toDataArray(states: State[]) {
    const data: number[] = [];
    for (const s of states) {
      for (const x of s.data) {
        data.push(x);
      }
    }
    return data;
  }

  data: Float32Array;
  readonly playerIndex: number;
  constructor(dataSize: number, playerIndex: number) {
    this.playerIndex = playerIndex;
    this.data = new Float32Array(dataSize);
  }
}