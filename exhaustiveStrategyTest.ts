import { debugPort } from "process";
import { ExhaustiveStrategy } from "./exhaustiveStrategy";
import { RunGame } from "./runGame";
import { State } from "./state";
import { StateMap } from "./stateMap";
import { StateSet } from "./stateSet";
import { TicTacToe } from "./ticTacToe";

console.log("exhaustiveStrategyTest");

function oneBranch() {
  const strategy = new ExhaustiveStrategy(3);
  console.assert(strategy.getMove(null).getLargestIndex() === 0);
  strategy.nextBranch();
  console.assert(strategy.getMove(null).getLargestIndex() === 1);
  strategy.nextBranch();
  console.assert(strategy.getMove(null).getLargestIndex() === 2);
  strategy.nextBranch();
  console.assert(strategy.done());
}

function twoBranches() {
  const strategy = new ExhaustiveStrategy(2);
  console.assert(strategy.getMove(null).getLargestIndex() === 0);
  strategy.nextBranch();
  console.assert(strategy.getMove(null).getLargestIndex() === 1);
  console.assert(strategy.getMove(null).getLargestIndex() === 0);
  strategy.nextBranch();
  console.assert(strategy.getMove(null).getLargestIndex() === 1);
  console.assert(strategy.getMove(null).getLargestIndex() === 1);
  strategy.nextBranch();
  console.assert(strategy.done());
}

function exhaust() {
  console.log("Exhausive search of Tic-Tac-Toe");
  const game = new TicTacToe();
  const strategy = new ExhaustiveStrategy(game.getMoveSize());

  let numGames = 0;
  const maxDepth = 6;
  while (!strategy.done()) {
    let state: State = game.getInitialState();
    let depth = 0;
    while (!state.isEnded() && depth < maxDepth) {
      const move = strategy.getMove(state);
      state = game.applyMove(state, move);
      ++depth;
    }
    ++numGames;
    strategy.nextBranch();
    if (numGames % 100000 === 0) {
      console.log(numGames);
    }
  }
  console.assert(numGames > 1000);
  // 28,881 - Search depth 5
  // 138,321 - Search depth 6
  // 533,457 - Search depth 7
  // 2,726,865 - if we travese to depth 9.
  console.log(`Games traversed: ${numGames}`);
}


function addOrInsert(sm: StateMap<StateSet>, key: State, value: State) {
  if (sm.has(key)) {
    sm.get(key).add(value);
  } else {
    const s = new StateSet();
    s.add(value);
    sm.set(key, s);
  }
}

function snacks() {
  console.log("Exhausive search of Tic-Tac-Toe");
  const game = new TicTacToe();
  const strategy = new ExhaustiveStrategy(game.getMoveSize());

  const sm = new StateMap<StateSet>();

  let numGames = 0;
  const maxDepth = 9;
  while (!strategy.done()) {
    let previousState: State = null;
    let state: State = game.getInitialState();
    if (previousState) {
      addOrInsert(sm, state, previousState);
    }
    let depth = 0;
    while (!state.isEnded() && depth < maxDepth) {
      const move = strategy.getMove(state);
      previousState = state;
      state = game.applyMove(state, move);
      if (sm.has(state) && !sm.get(state).has(previousState)) {
        // We have reached this state before from a different path.
        // Because this is a depth first search, this means we have
        // already explored this path.
        break;
      } else {
        addOrInsert(sm, state, previousState);
      }
      ++depth;
    }
    ++numGames;
    strategy.nextBranch();
    if (numGames % 100000 === 0) {
      console.log(numGames);
    }
  }
  console.assert(numGames > 1000);
  // 28,881 - Search depth 5
  // 138,321 - Search depth 6
  // 533,457 - Search depth 7
  // 2,726,865 - if we travese to depth 9.
  console.log(`Games traversed: ${numGames}`);
  // https://en.wikipedia.org/wiki/Game_complexity#:~:text=For%20tic%2Dtac%2Dtoe%2C,have%20a%20row%20of%20three.
  // There are 5478 distinct states, but there are also the 4518 states where
  // a player makes an illegal move and forfeits the game.  Total: 9996
  console.assert(sm.size() === 9996)
  console.log(`Distinct States: ${sm.size()}`);

  for (const k of sm.stringKeys()) {
    console.log(k);
  }
}

oneBranch();
twoBranches();
exhaust();
snacks();

console.log("Done.");