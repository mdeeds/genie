import { Move } from "./move";
import { State } from "./state";
import { Strategy } from "./strategy";

class Ritter {
  private current: number;
  private low: number;
  private high: number;

  // Iterates over the range [low, ... high] inclusive.
  constructor(low: number, high: number) {
    this.current = low;
    this.low = low;
    this.high = high;
  }
  done(): boolean {
    return this.current > this.high;
  }
  get() {
    return this.current;
  }
  increment() {
    console.assert(!this.done());
    ++this.current;
  }
  reset() {
    this.current = this.low;
  }
}

// This strategy tries all possible moves.  You need to call 'nextBranch'
// to get the next sequence of moves.
//
// See exhaustiveStrategyTest.ts for an example playing through
// all possible games in TicTacToe.
export class ExhaustiveStrategy implements Strategy {
  private moveSequence: Ritter[] = [];
  private index: number;
  private moveSize: number;
  private isDone: boolean = false;
  constructor(moveSize: number) {
    this.moveSize = moveSize;
    this.index = 0;
  }

  sequenceToList() {
    const result: number[] = [];
    for (const r of this.moveSequence) {
      result.push(r.get());
    }
    return result;
  }

  getMove(state: State): Move {
    if (this.index >= this.moveSequence.length) {
      this.moveSequence.push(new Ritter(0, this.moveSize - 1));
    }
    const move = new Move(this.moveSize);
    const r = this.moveSequence[this.index];
    if (r.done()) {
      let allDone = true;
      for (const ritter of this.moveSequence) {
        if (!ritter.done()) {
          allDone = false;
          break;
        }
      }
      if (allDone) {
        this.isDone = true;
      }
      r.reset();
    }
    const movePosition = r.get();

    move.data[movePosition] = 1.0;
    ++this.index;
    return move;
  }

  nextBranch() {
    this.moveSequence.splice(this.index);
    let r = this.moveSequence[this.index - 1];

    r.increment();
    while (r.done()) {
      this.index--;
      this.moveSequence.splice(this.index);
      if (this.index === 0) {
        this.isDone = true;
        break;
      }
      r = this.moveSequence[this.index - 1];
      r.increment();
    }
    this.index = 0;
  }

  done(): boolean {
    return this.isDone;
  }
}