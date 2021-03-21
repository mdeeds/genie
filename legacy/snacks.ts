import { MoveNode } from "./gameDag";
import { Move } from "./move";
import { State } from "./state";

class Snack {
  private readonly kBaseWinRate = 0.5;
  private readonly kAlpha = 6.0;

  state: State;
  move: Move;
  gameCount: number;
  winCount: number;
  constructor(state: State, move: Move) {
    this.state = state;
    this.move = move;
    this.gameCount = 0;
    this.winCount = 0;
  }
  getWinRate() {
    return (this.winCount + this.kAlpha * this.kBaseWinRate) /
      (this.gameCount + this.kAlpha);
  }
}

export class Snacks {
  private allSnacks: Map<string, Snack>;
  private snacksByState: Map<string, Snack[]>;


  constructor() {
    this.allSnacks = new Map<string, Snack>();
    this.snacksByState = new Map<string, Snack[]>();
  }

  private getStateKey(state: State) {
    return `${JSON.stringify(state.data)}:${state.playerIndex}`;
  }

  private getSnackKey(state: State, move: Move) {
    return `${JSON.stringify(state.data)}:${state.playerIndex}:${move.data}`;
  }

  // Adds state+move to this set of Snacks.  If the snack already exists,
  // it is updated.
  addSnack(state: State, move: Move, leadsToWin: boolean) {
    const key = this.getSnackKey(state, move);
    let snack: Snack = null;
    if (this.allSnacks.has(key)) {
      snack = this.allSnacks.get(key);
    } else {
      snack = new Snack(state, move);
      this.allSnacks.set(key, snack);
      const stateKey = this.getStateKey(state);
      let snackList: Snack[] = [];
      if (this.snacksByState.has(stateKey)) {
        snackList = this.snacksByState.get(stateKey);
      } else {
        this.snacksByState.set(stateKey, snackList);
      }
      snackList.push(snack);
    }
    snack.gameCount++;
    if (leadsToWin) {
      snack.winCount++;
    }
  }

  private getIndexOfMax(a: Float32Array) {
    let indexOfMax = 0;
    let maxValue = a[0];
    for (let i = 1; i < a.length; ++i) {
      if (a[i] > maxValue) {
        maxValue = a[i];
        indexOfMax = i;
      }
    }
    return indexOfMax;
  }

  // Produces a state-move pair for every known state.
  // The values in the move are not indicators (i.e. 1 or 0) they are 
  // the calculated probability of winning from the state we get to
  // when applying the move.
  getMoveVectors(outStates: State[], outMoves: Move[]) {
    for (const snackList of this.snacksByState.values()) {
      const state = snackList[0].state;
      const move = new Move(snackList[0].move.data.length);
      for (let i = 0; i < move.data.length; ++i) {
        move.data[i] = 0.5;
      }
      for (const snack of snackList) {
        move[this.getIndexOfMax(snack.move.data)] = snack.getWinRate();
      }
      outStates.push(state);
      outMoves.push(move);
    }
  }
}