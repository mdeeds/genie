export class Move {
  static toDataArray(moves: Move[]) {
    const data: number[] = [];
    for (const m of moves) {
      for (const x of m.data) {
        data.push(x);
      }
    }
    return data;
  }

  data: Float32Array;
  constructor(dataSize: number) {
    this.data = new Float32Array(dataSize);
  }
}