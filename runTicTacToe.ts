import { RandomStrategy } from "./randomStrategy";
import { RunGame } from "./runGame";
import { TicTacToe } from "./ticTacToe";

export class RunTicTacToe {
  static run() {
    const g = new TicTacToe();
    const s = new RandomStrategy(g);

    const runner = new RunGame();
    for (let i = 0; i < 100; ++i) {
      runner.collectWinData(g, [s, s]);
    }
  }
}