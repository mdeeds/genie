import { ExhaustiveStrategy } from "./exhaustiveStrategy";
import { Game } from "./game";
import { Move } from "./move";
import { State } from "./state";
import { StateMap } from "./stateMap";
import { StateSet } from "./stateSet";
import { Strategy } from "./strategy";

export class RunGame {
  constructor() {
  }

  private oneHotMove(move: Move) {
    let maxValue = -1000;
    let maxIndex = 0;
    const result = new Move(move.data.length);
    for (let i = 0; i < move.data.length; ++i) {
      result[i] = (0.1 / (move.data.length - 1));
      if (move.data[i] > maxValue) {
        maxValue = move.data[i];
        maxIndex = i;
      }
    }
    result.data[maxIndex] = 0.9;
    return result;
  }

  // Runs the game, returns the player number who won or -1 if there is
  // no winner.
  private run(game: Game, strategies: Strategy[],
    outStates: State[], outWinProb: Float32Array[]): void {
    const states: State[] = [];

    console.assert(game.getPlayerCount() === strategies.length);
    let state = game.getInitialState();
    while (!state.isEnded()) {
      const currentPlayer = state.playerIndex;
      const move = strategies[currentPlayer].getMove(state);
      states.push(state);
      state = game.applyMove(state, move);
    }
    states.push(state);
    const winners = state.winners;
    for (const s of states) {
      outStates.push(s);
      outWinProb.push(winners);
    }
  }

  // outWinProb will be populated with indicators (0 for loss, 1 for win)
  // for the players in the game.
  collectWinData(game: Game, strategies: Strategy[],
    outStates: State[], outWinProb: Float32Array[], gameCount: number): void {
    for (let i = 0; i < gameCount; ++i) {
      this.run(game, strategies, outStates, outWinProb);
    }
  }

  private addWinData(visitedStates: StateMap<StateSet>,
    state: State, winners: Float32Array,
    outStates: State[], outWinProb: Float32Array[],
    depth: number) {
    if (depth === 0) {
      return;
    }
    outStates.push(state);
    outWinProb.push(winners);

    const lessWinners = new Float32Array(winners);
    // Blend toward 50% probability.  Keep 50% (alpha) of previous value.
    const alpha = 0.5;
    for (let i = 0; i < lessWinners.length; ++i) {
      lessWinners[i] = 0.5 * (1 - alpha) + lessWinners[i] * alpha;
    }

    if (visitedStates.has(state)) {
      for (const previousState of visitedStates.get(state).values()) {
        this.addWinData(visitedStates, previousState,
          lessWinners, outStates, outWinProb, depth - 1);
      }
    }
  }

  // Make the X and O win states disjoint.  Also add 
  // a set of states where either can win, and give that a 50% probability.
  // Better would be to make this a minimax estimate.
  private reduceWinData(inOutStates: State[], inOutWinProbs: Float32Array[]) {
    const playerZeroWinStates = new StateSet();
    const playerZeroLoseStates = new StateSet();
    const bothWinStates = new StateSet();

    for (const s of inOutStates) {
      if (s.hasWinner()) {
        if (s.winners[0] > 0) {
          playerZeroWinStates.add(s);
        } else {
          playerZeroLoseStates.add(s);
        }
      }
    }

    for (const winningState of playerZeroWinStates.values()) {
      if (playerZeroLoseStates.has(winningState)) {
        playerZeroLoseStates.delete(winningState);
        bothWinStates.add(winningState);
      }
    }
    for (const losingState of playerZeroLoseStates.values()) {
      if (playerZeroWinStates.has(losingState)) {
        playerZeroWinStates.delete(losingState);
        bothWinStates.add(losingState);
      }
    }
    inOutStates.splice(0);
    inOutWinProbs.splice(0);
    for (const s of playerZeroWinStates.values()) {
      inOutStates.push(s);
      inOutWinProbs.push(new Float32Array([1, 0]));
    }
    for (const s of playerZeroLoseStates.values()) {
      inOutStates.push(s);
      inOutWinProbs.push(new Float32Array([0, 1]));
    }
    for (const s of bothWinStates.values()) {
      inOutStates.push(s);
      inOutWinProbs.push(new Float32Array([0.5, 0.5]));
    }
  }

  private addOrInsert(sm: StateMap<StateSet>, key: State, value: State) {
    if (sm.has(key)) {
      sm.get(key).add(value);
    } else {
      const s = new StateSet();
      s.add(value);
      sm.set(key, s);
    }
  }

  collectExhaustiveWinData(game: Game,
    outStates: State[], outWinProb: Float32Array[]): void {
    const strategy = new ExhaustiveStrategy(game.getMoveSize());
    const visitedStates = new StateMap<StateSet>();
    while (!strategy.done()) {
      let previousState: State = null;
      let state = game.getInitialState();
      while (!state.isEnded()) {
        const move = strategy.getMove(state);
        previousState = state;
        state = game.applyMove(state, move);
        if (visitedStates.has(state) &&
          !visitedStates.get(state).has(previousState)) {
          // Already traversed from another path.
          break;
        } else {
          this.addOrInsert(visitedStates, state, previousState);
        }
      }
      if (!state.isForfeit() && state.hasWinner()) {
        // This was a legitimate win.
        this.addWinData(visitedStates, state, state.winners,
          outStates, outWinProb, 6);
      }
      strategy.nextBranch();
    }
    // this.reduceWinData(outStates, outWinProb);
  }
}