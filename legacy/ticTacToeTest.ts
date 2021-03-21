import { Move } from "./move";
import { State } from "./state";
import { TicTacToe } from "./ticTacToe";

console.log("Start testing.");

function t1() {
  console.log("t1");
  const ttt = new TicTacToe();

  const almostWinning = new State(ttt.getStateSize(), 0, ttt.getPlayerCount());
  almostWinning.data[0] = 1;
  almostWinning.data[1] = 1;

  const winningMove = new Move(ttt.getMoveSize());
  winningMove.data[2] = 1.0;

  const winning = ttt.applyMove(almostWinning, winningMove);

  console.assert(winning.isEnded());
  console.assert(winning.winners[0] == 1);
}

function t2() {
  console.log("t2");
  const ttt = new TicTacToe();

  const almostWinning = new State(ttt.getStateSize(), 0, ttt.getPlayerCount());
  almostWinning.data[0] = 1;
  almostWinning.data[6] = 1;

  const winningMove = new Move(ttt.getMoveSize());
  winningMove.data[3] = 1.0;

  const winning = ttt.applyMove(almostWinning, winningMove);

  console.assert(winning.isEnded());
  console.assert(winning.winners[0] === 1.0);
}

function playOrderedMoves() {
  // Playing moves in order results in this:
  // X O X
  // O X O
  // X . .
  const ttt = new TicTacToe();
  let state = ttt.getInitialState();
  for (let i = 0; i < 7; ++i) {
    const move = new Move(ttt.getMoveSize());
    move.data[i] = 1.0;
    state = ttt.applyMove(state, move);
  }
  console.assert(state.isEnded);
  console.assert(state.winners[0] === 1.0);
  console.assert(state.winners[1] === 0.0);
}

function repeatMove() {
  const ttt = new TicTacToe();
  let state = ttt.getInitialState();

  const move1 = new Move(ttt.getMoveSize());
  move1.data[0] = 1;
  const move2 = new Move(ttt.getMoveSize());
  move2.data[0] = 1;
  console.log("Applying Move 1");
  state = ttt.applyMove(state, move1);
  console.assert(!state.isEnded());
  console.log("Applying Move 2");
  state = ttt.applyMove(state, move2);
  console.assert(state.isEnded());
  console.log("Checking winner");
  console.assert(state.winners[0] === 1.0);
  console.assert(state.winners[1] === 0.0);
}


t1();
t2();
playOrderedMoves();
repeatMove();

console.log("Done testing.");

