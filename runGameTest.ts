import { DumbEstimator } from "./dumbEstimator";
import { RunGame } from "./runGame";
import { State } from "./state";
import { TicTacToe } from "./ticTacToe";
import { WinEstimatorStrategy } from "./winEstimatorStrategy";

function t1() {
  const runner = new RunGame();

  const ttt = new TicTacToe();
  const de = new DumbEstimator(ttt);
  const p1 = new WinEstimatorStrategy(ttt, de);
  const p2 = new WinEstimatorStrategy(ttt, de);

  const states: State[] = [];
  const probs: number[][] = [];
  runner.collectWinData(ttt, [p1, p2], states, probs, 2);

  for (const s of states) {
    console.log(s.data);
    if (s.isEnded()) {
      console.log(`Winner: ${s.winner}`);
    }
  }

  console.log("Probabilities:");
  for (const p of probs) {
    console.log(p);
  }

  console.assert(states.length === probs.length);
  console.assert(probs[0].length === ttt.getPlayerCount());
}

/*

Float32Array [
   1, 0, 1, 
   0, 1, 0, 
   1, 0, 0, 
   
   0, 1, 0, 
   1, 0, 1, 
   0, 0, 0 ]

*/

t1();