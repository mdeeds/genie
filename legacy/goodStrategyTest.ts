import { GoodStrategy } from "./goodStrategy";
import { OneDie } from "./oneDie";
import { RunGame } from "./runGame";
import { State } from "./state";

function t1() {
  const oneDie = new OneDie();
  const strategy = new GoodStrategy(oneDie);
  const runner = new RunGame();

  const states: State[] = [];
  const probs: Float32Array[] = [];
  const numGames = 1000;
  runner.collectWinData(oneDie, [strategy], states, probs, numGames);

  let winRate = 0.0;
  for (const s of states) {
    if (s.isEnded() && s.hasWinner()) {
      winRate += 1 / numGames;
    }
  }
  console.log(`Win Rate: ${winRate}`);
  console.assert(winRate > 0.7);
}

t1();