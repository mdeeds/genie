import { ModelStrategy } from "./modelStrategy";
import { Game } from "./game";
import { OneDie } from "./oneDie";
import { RandomStrategy } from "./randomStrategy";
import { RunGame } from "./runGame";
import { GoodStrategy } from "./goodStrategy";
import { Strategy } from "./strategy";

const g: Game = new OneDie(2);
const s = new RandomStrategy(g);

console.log("Starting.");

const runner = new RunGame();
const trainingStates: Float32Array[] = [];
const trainingMoves: Float32Array[] = [];
runner.collectWinData(g, [s, s], trainingStates, trainingMoves);

console.log(`Collected ${trainingMoves.length} moves.`);

const m: ModelStrategy = new ModelStrategy(g);

const resultDiv = document.createElement('div');
const body = document.getElementsByTagName('body')[0];
body.append(resultDiv);

function addRow(trainingSession: number, winRate: number) {
  const row = document.createElement('div');
  row.innerText = `${trainingSession}, ${winRate}`;
  resultDiv.appendChild(row);
}

function makeCanvas(strategy: Strategy, round: number, game: Game) {
  const pixelData = new Uint8ClampedArray(30 * 30 * 4);
  for (let x = 0; x < 30; ++x) {
    for (let y = 0; y < 30; ++y) {
      const state = new Float32Array(game.getStateSize())
      state[0] = x;
      state[1] = round;
      state[2] = y;
      const move = strategy.getMove(state);
      const i = x * 4 + y * 4 * 30;
      pixelData[i + 0] = 255 * move[0];
      pixelData[i + 1] = (move[0] > move[1]) ? 255 : 0;
      pixelData[i + 2] = 255 * move[1];
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

function makeCanvasSet(strategy: Strategy, game: Game) {
  const body = document.getElementsByTagName('body')[0];
  const div = document.createElement('div');
  body.appendChild(div);

  for (let r = 0; r < 5; ++r) {
    const canvas = makeCanvas(strategy, r, game);
    div.appendChild(canvas);
  }
}

makeCanvasSet(s, g);

var trainingSession = 0;

function loop(iterations: number) {
  if (iterations === 0) {
    console.log("Done");
    return;
  }

  const trainStart = window.performance.now();
  m.train(trainingStates, trainingMoves).then((history) => {
    console.log(`Examples: ${trainingStates.length}`);
    const elapsedSeconds = (window.performance.now() - trainStart) / 1000;
    console.log(`Training time: ${elapsedSeconds}`);
    makeCanvasSet(m, g);
    const losses = history.history['loss'] as number[];
    if (losses) {
      console.log(`First loss: ${losses[0]}`);
      console.log(`Last loss: ${losses[losses.length - 1]}`);
    } else {
      console.log(JSON.stringify(history.history));
    }

    // Keep the most recent 400 training examples.
    while (trainingStates.length > 400) {
      trainingStates.shift();
      trainingMoves.shift();
    }
    const winRate = runner.collectWinData(g, [m, m],
      trainingStates, trainingMoves);
    ++trainingSession;
    addRow(trainingSession, winRate);
    if (trainingStates.length <= 400) {
      // If we didn't collect any new data, add some more random strategy data.
      runner.collectWinData(g, [s, s], trainingStates, trainingMoves);
    }
    setTimeout(() => { loop(iterations - 1); });
  });
}

setTimeout(() => { console.log("Begin loop."); loop(100); }, 1000);
