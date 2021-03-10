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

  constructor(state: State) {
    this.state = state;
  }
  addChild(move: Move, nextState: StateNode) {
    const moveNode = new MoveNode(move, nextState);
    this.children.push(moveNode);
    nextState.parents.push(this);
  }

  // Marks a win on this node and all parents of this node with the
  // same player index.
  markWin(playerIndex = -1) {
    const pi = playerIndex < 0 ? this.state.playerIndex : playerIndex;
    if (pi === this.state.playerIndex) {
      this.wins++;
    }
    for (const p of this.parents) {
      p.markWin(pi);
    }
  }
  addVisit() {
    this.visits++;
  }

  getWinRate() {
    return this.wins / this.visits;
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
  addState(state: State): StateNode {
    const key = this.getKey(state);
    let stateNode: StateNode = null;
    if (this.knownStates.has(key)) {
      stateNode = this.knownStates.get(key);
    } else {
      stateNode = new StateNode(state);
      this.knownStates.set(key, stateNode);
    }
    stateNode.addVisit();
    return stateNode;
  }
}