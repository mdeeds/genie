import { Game } from "./game";
import { ModelStrategy } from "./modelStrategy";
import { Move } from "./move";
import { OneDie } from "./oneDie";
import { RandomStrategy } from "./randomStrategy";
import { RunGame } from "./runGame";
import { State } from "./state";
import { Strategy } from "./strategy";

export class RunOneDie {
  static makeCanvas(strategy: Strategy, round: number, game: Game) {
    const pixelData = new Uint8ClampedArray(30 * 30 * 4);
    for (let x = 0; x < 30; ++x) {
      for (let y = 0; y < 30; ++y) {
        const state = new State(game.getStateSize(), 0, game.getPlayerCount());
        state.data[0] = x;
        state.data[1] = round;
        state.data[2] = y;
        const move = strategy.getMove(state);
        const i = x * 4 + y * 4 * 30;
        pixelData[i + 0] = 255 * move.data[0];
        pixelData[i + 1] = (move.data[0] > move.data[1]) ? 255 : 0;
        pixelData[i + 2] = 255 * move.data[1];
        pixelData[i + 3] = 255;
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = 30;
    canvas.height = 30;
    canvas.style.setProperty('width', '150px');
    canvas.style.setProperty('height', '150px');
    const ctx = canvas.getContext('2d');
    ctx.putImageData(new ImageData(pixelData, 30, 30), 0, 0);
    return canvas;
  }

  static makeCanvasSet(strategy: Strategy, game: Game) {
    const body = document.getElementsByTagName('body')[0];
    const div = document.createElement('div');
    body.appendChild(div);

    for (let r = 0; r < 5; ++r) {
      const canvas = RunOneDie.makeCanvas(strategy, r, game);
      div.appendChild(canvas);
    }
  }

  static run() {
    const g: Game = new OneDie(2);
    const s = new RandomStrategy(g);

    console.log("Starting.");

    const runner = new RunGame();
    // const trainingStates: State[] = [];
    // const trainingMoves: Move[] = [];
    runner.collectWinData(g, [s, s], [], [], 1000);

    const m: ModelStrategy = new ModelStrategy(g);

    const resultDiv = document.createElement('div');
    const body = document.getElementsByTagName('body')[0];
    body.append(resultDiv);

    // TODO: Nice if we could plumb the win rate back in here.
    function addRow(trainingSession: number) {
      const row = document.createElement('div');
      row.innerText = `${trainingSession}`;
      resultDiv.appendChild(row);
    }

    RunOneDie.makeCanvasSet(s, g);

    var trainingSession = 0;

    function loop(iterations: number) {
      if (iterations === 0) {
        console.log("Done");
        return;
      }

      const trainingStates: State[] = [];
      const trainingMoves: Move[] = [];
      runner.getSnacks().getMoveVectors(trainingStates, trainingMoves)

      const trainStart = window.performance.now();
      m.train(trainingStates, trainingMoves).then((history) => {
        console.log(`Examples: ${trainingStates.length}`);
        const elapsedSeconds = (window.performance.now() - trainStart) / 1000;
        console.log(`Training time: ${elapsedSeconds}`);
        RunOneDie.makeCanvasSet(m, g);
        const losses = history.history['loss'] as number[];
        if (losses) {
          console.log(`First loss: ${losses[0]}`);
          console.log(`Last loss: ${losses[losses.length - 1]}`);
        } else {
          console.log(JSON.stringify(history.history));
        }
        // TODO: probably want to delete everything??? Need to rethink this.
        // Keep the most recent 400 training examples.
        while (trainingStates.length > 5000) {
          trainingStates.shift();
          trainingMoves.shift();
        }
        // TODO: Do something with the output data.
        runner.collectWinData(g, [m, m], [], [], 1000);
        ++trainingSession;
        addRow(trainingSession);
        if (trainingStates.length <= 10000) {
          // If we didn't collect much new data, add some more random strategy data.
          runner.collectWinData(g, [s, s], [], [], 1000);
        }
        setTimeout(() => { loop(iterations - 1); });
      });
    }
    setTimeout(() => { console.log("Begin loop."); loop(100); }, 1000);
  }
}