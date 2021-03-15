import { WinEstimatorStrategy } from "./winEstimatorStrategy";
import { State } from "./state";
import { TicTacToe } from "./ticTacToe";
import { ModelEstimator } from "./modelEstimator";
import { DumbEstimator } from "./dumbEstimator";

async function t1() {
  console.log("t1");
  const ttt = new TicTacToe();
  const de = new DumbEstimator(ttt);
  const wes = new WinEstimatorStrategy(ttt, de);
  const almostWinning = new State(ttt.getStateSize(), 0, ttt.getStateSize());
  almostWinning.data[0] = 1;
  almostWinning.data[1] = 1;

  const winningMove = wes.getMove(almostWinning);
  console.assert(winningMove.data[2] === 1.0);
}

async function t2() {
  console.log("t2");
  const ttt = new TicTacToe();
  const de = new DumbEstimator(ttt);
  const wes = new WinEstimatorStrategy(ttt, de);
  const almostWinning = new State(ttt.getStateSize(), 1, ttt.getStateSize());
  almostWinning.data[9] = 1;
  almostWinning.data[17] = 1;

  const winningMove = wes.getMove(almostWinning);
  console.assert(winningMove.data[4] === 1.0);
}

async function t3() {
  console.log("t3");
  const ttt = new TicTacToe();
  const de = new DumbEstimator(ttt);
  const wes = new WinEstimatorStrategy(ttt, de);
  const almostWinning = new State(ttt.getStateSize(), 0, ttt.getStateSize());
  almostWinning.data[3] = 1;
  almostWinning.data[5] = 1;
  almostWinning.data[17] = 1;

  const winningMove = wes.getMove(almostWinning);
  console.assert(winningMove.data[4] === 1.0);
}

async function run() {
  await t1();
  await t2();
  await t3();
}

run().then(() => { console.log("Done."); });
