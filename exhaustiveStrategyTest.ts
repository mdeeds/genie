import { debugPort } from "process";
import { ExhaustiveStrategy } from "./exhaustiveStrategy";
import { RunGame } from "./runGame";
import { State } from "./state";
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

oneBranch();
twoBranches();
exhaust();

console.log("Done.");