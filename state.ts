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
  winners: Float32Array;
  ended: boolean;
  playerIndex: number;
  constructor(dataSize: number, playerIndex: number, playerCount: number) {
    this.playerIndex = playerIndex;
    this.data = new Float32Array(dataSize);
    this.winners = new Float32Array(playerCount);
    this.ended = false;
  }

  clone(): State {
    const resultState = new State(this.data.length,
      this.playerIndex, this.winners.length);
    resultState.data = new Float32Array(this.data);
    resultState.winners = new Float32Array(this.winners);
    resultState.ended = this.ended;
    return resultState;
  }

  isEnded(): boolean {
    return this.ended;
  }

  hasWinner(): boolean {
    for (const w of this.winners) {
      if (w > 0) {
        return true;
      }
    }
    return false;
  }
}