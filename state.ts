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
  // Negative number indicates the game is not over.
  // Positive number indicates the winner's player index.
  winner: number;
  readonly playerIndex: number;
  constructor(dataSize: number, playerIndex: number, winner: number = -1) {
    this.playerIndex = playerIndex;
    this.data = new Float32Array(dataSize);
    this.winner = winner;
  }

  isEnded() {
    return this.winner >= 0;
  }
}