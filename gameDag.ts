import { Move } from "./move";
import { State } from "./state";

export class MoveNode {
  move: Move;
  child: StateNode;
  constructor(move: Move, nextState: StateNode) {
    this.move = move;
    this.child = nextState;
  }
}

export class StateNode {
  private visits = 0;
  private wins = 0;
  readonly state: State;
  private children: MoveNode[] = [];
  private parents: StateNode[] = [];

  private readonly kBaseWinRate = 0.5;
  private readonly kAlpha = 6.0;

  constructor(state: State) {
    this.state = state;
  }
  addChild(move: Move, nextState: StateNode) {
    const moveNode = new MoveNode(move, nextState);
    this.children.push(moveNode);
    nextState.parents.push(this);
  }

  addVisit(leadsToWin: boolean) {
    this.visits++;
    if (leadsToWin) {
      this.wins++;
    }
  }

  getWinRate() {
    return (this.wins + this.kAlpha * this.kBaseWinRate) /
      (this.visits + this.kAlpha);
  }
}

// Represents a Directed Acyclic Graph (DAG) of the game.
// Identical states are represented with the same node.  If there are 
// multiple ways to get to the same state, that state will have multiple
// parents.  Thus, this is a DAG, not a tree.
export class GameDag {
  private knownStates: Map<string, StateNode>;

  constructor() {
    this.knownStates = new Map<string, StateNode>();
  }

  private getKey(state: State) {
    return `${JSON.stringify(state.data)}:${state.playerIndex}`;
  }

  // Adds state to this DAG.  If state already exists in DAG,
  // this increments the visit count.
  addState(state: State, leadsToWin: boolean): StateNode {
    const key = this.getKey(state);
    let stateNode: StateNode = null;
    if (this.knownStates.has(key)) {
      stateNode = this.knownStates.get(key);
    } else {
      stateNode = new StateNode(state);
      this.knownStates.set(key, stateNode);
    }
    stateNode.addVisit(leadsToWin);
    return stateNode;
  }

  // Produces a state-move pair for every known state.
  // The values in the move are not indicators (i.e. 1 or 0) they are 
  // the calculated probability of winning from the state we get to
  // when applying the move.
  getMoveVectors(outStates: State[], outMoves: Move[]) {

  }
}