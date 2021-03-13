import { MoveNode } from "./gameDag";
import { MonteCarloEstimator } from "./monteCarloEstimator";
import { OneDie } from "./oneDie";
import { RunGame } from "./runGame";
import { State } from "./state";
import { WinEstimatorStrategy } from "./winEstimatorStrategy";

function t1() {
  const oneDie = new OneDie();
  const estimator = new MonteCarloEstimator(oneDie);
  const strategy = new WinEstimatorStrategy(
    oneDie, estimator, /*moveNoise=*/0.0);

  const runner = new RunGame();

  const states: State[] = [];
  const probs: number[][] = [];
  const numGames = 100;
  runner.collectWinData(oneDie, [strategy], states, probs, numGames);

  let winRate = 0.0;
  for (const s of states) {
    if (s.isEnded() && s.winner === 0) {
      winRate += 1 / numGames;
    }
  }
  console.log(`Win Rate: ${winRate}`);
  console.assert(winRate > 0.8);
}

t1();