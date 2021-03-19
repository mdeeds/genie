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

  private static bigMessage(message: string) {
    const body = document.getElementsByTagName('body')[0];
    const h = document.createElement('h1');
    h.innerText = message;
    body.appendChild(h);
  }

  static async run() {
    const g = new TicTacToe();
    const s = new RandomStrategy(g);
    const runner = new RunGame();
    const exampleStates: State[] = [];
    const exampleWinProbs: Float32Array[] = [];

    runner.collectExhaustiveWinData(g, exampleStates, exampleWinProbs);
    console.assert(exampleStates.length === exampleWinProbs.length);
    console.assert(exampleWinProbs[0].length === g.getPlayerCount(),
      `Prob count: ${exampleWinProbs[0].length}`);

    console.log(`Training data size: ${exampleWinProbs.length}`);

    RunTicTacToe.bigMessage("Training Data");
    for (let i = 0; i < 10; ++i) {
      const index = Math.trunc(Math.random() * exampleStates.length);
      const state = exampleStates[index];
      const prob = exampleWinProbs[index];
      RunTicTacToe.visualizeState(
        state, `${state.isEnded() ? "ended" : "-"}; ` +
        `to play: ${state.playerIndex}; ` +
        `X win: ${prob[0].toFixed(3)}; ` +
      `O win: ${prob[1].toFixed(3)}; `);
    }

    const baseDataSize = exampleStates.length;

    const e1 = await ModelEstimator.make(g);
    const p1 = new WinEstimatorStrategy(g, e1, /*moveNoise=*/0.0);

    for (let i = 0; i < 10; ++i) {
      console.log(`Iteration ${i}`);
      const history = await e1.train(exampleStates, exampleWinProbs);
      console.log(`Loss: ${history.history.loss}`);

      const trainedStates: State[] = [];
      const trainedWinProbs: Float32Array[] = [];
      runner.collectWinData(g, [p1, p1], trainedStates, trainedWinProbs, 1);

      RunTicTacToe.bigMessage(`Game Results: Iteration ${i}`);
      for (let i = 0; i < trainedStates.length; ++i) {
        const state = trainedStates[i];
        const prob: Float32Array[] = e1.probabilityOfWin([state]);
        RunTicTacToe.visualizeState(
          state,
          `to play: ${state.playerIndex}; ` +
          `X win: ${prob[0][0].toFixed(3)}; ` +
          `O win: ${prob[0][1].toFixed(3)}; `);
      }

      const keepPortion = Math.round(baseDataSize / (i + 1));
      exampleStates.splice(keepPortion);
      exampleWinProbs.splice(keepPortion);
      const dataCollectionStrategy =
        new WinEstimatorStrategy(g, e1, /*moveNoise=*/0.1);
      runner.collectWinData(g,
        [dataCollectionStrategy, dataCollectionStrategy],
        exampleStates, exampleWinProbs, 100);
      console.log(`Sample size: ${exampleStates.length}`);
    }

    console.log("Done.");
  }
}