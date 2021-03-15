import { MoveNode } from "./gameDag";
import { MonteCarloEstimator } from "./monteCarloEstimator";
import { RandomStrategy } from "./randomStrategy";
import { RunGame } from "./runGame";
import { State } from "./state";
import { TicTacToe } from "./ticTacToe";
import { WinEstimatorStrategy } from "./winEstimatorStrategy";

function t1() {
  const game = new TicTacToe();
  const randomStrategy = new RandomStrategy(game);
  const estimator = new MonteCarloEstimator(game);
  const strategy = new WinEstimatorStrategy(
    game, estimator, /*moveNoise=*/0.0);

  const runner = new RunGame();

  const states: State[] = [];
  const probs: Float32Array[] = [];
  const numGames = 100;
  runner.collectWinData(game, [strategy, randomStrategy],
    states, probs, numGames);

  let mcWinRate = 0.0;
  let randomWinRate = 0.0;
  for (const s of states) {
    if (s.isEnded()) {
      if (s.winners[0] > 0) {
        mcWinRate += 1 / numGames;
        console.assert(s.winners[1] === 0);
      }
      if (s.winners[1] > 0) {
        randomWinRate += 1 / numGames;
        console.assert(s.winners[0] === 0);
      }
    }
  }
  console.log(`MC Win Rate: ${mcWinRate.toFixed(3)}`);
  console.log(`Random win Rate: ${randomWinRate.toFixed(3)}`);
  console.assert(mcWinRate > 0.2);
  console.assert(mcWinRate > randomWinRate);
}

t1();