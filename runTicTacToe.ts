import { WinEstimatorStrategy } from "./winEstimatorStrategy";
import { ModelStrategy } from "./modelStrategy";
import { RandomStrategy } from "./randomStrategy";
import { RunGame } from "./runGame";
import { State } from "./state";
import { TicTacToe } from "./ticTacToe";
import { ModelEstimator } from "./modelEstimator";

export class RunTicTacToe {

  private static visualizeState(state: State, message: string) {
    const conatiner = document.createElement('div');
    conatiner.classList.add('state');
    for (let i = 0; i < 3; ++i) {
      const row = document.createElement('div');
      for (let j = 0; j < 3; ++j) {
        const cell = document.createElement('span');
        cell.classList.add('cell');
        if (state.data[i + j * 3] > 0) {
          cell.innerText = 'X';
        } else if (state.data[i + j * 3 + 9] > 0) {
          cell.innerText = 'O';
        } else {
          cell.innerText = '_';
        }
        row.appendChild(cell);
      }
      conatiner.appendChild(row);
    }
    const messageDiv = document.createElement('div');
    messageDiv.innerText = message;
    conatiner.appendChild(messageDiv);
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(conatiner);
  }

  static async run() {
    const g = new TicTacToe();
    const s = new RandomStrategy(g);
    const runner = new RunGame();
    const exampleStates: State[] = [];
    const exampleWinProbs: number[] = [];
    runner.collectWinData(g, [s, s], exampleStates, exampleWinProbs, 1000);
    console.assert(exampleStates.length === exampleWinProbs.length);

    const e1 = await ModelEstimator.make(g);
    const e2 = await ModelEstimator.make(g);
    const p1 = new WinEstimatorStrategy(g, e1);
    const p2 = new WinEstimatorStrategy(g, e2);

    console.log("Training P1");
    await e1.train(exampleStates, exampleWinProbs);
    console.log("Training P2");
    await e2.train(exampleStates, exampleWinProbs);
    console.log("Done training.");

    exampleWinProbs.splice(0, exampleWinProbs.length);
    exampleStates.splice(0, exampleStates.length);
    runner.collectWinData(g, [p1, p2], exampleStates, exampleWinProbs, 20);

    for (let i = 0; i < 20; ++i) {
      const state = exampleStates[i];
      const prob: number[] = e1.probabilityOfWin([state]);
      RunTicTacToe.visualizeState(
        state, `Win: ${exampleWinProbs[i]}; ` +
        `to play: ${state.playerIndex}; ` +
      `prob: ${prob[0].toFixed(3)}`);
    }
  }
}