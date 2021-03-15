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


t1();
t2();

console.log("Done testing.");

