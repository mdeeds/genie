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

  getLargestIndex() {
    let largestValue = this.data[0];
    let largestIndex = 0;
    for (let i = 1; i < this.data.length; ++i) {
      if (this.data[i] > largestValue) {
        largestValue = this.data[i];
        largestIndex = i;
      }
    }
    return largestIndex;
  }

  data: Float32Array;
  constructor(dataSize: number) {
    this.data = new Float32Array(dataSize);
  }
}