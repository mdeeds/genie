import { ModelStrategy } from "./modelStrategy";
import { Game } from "./game";
import { OneDie } from "./oneDie";
import { RandomStrategy } from "./randomStrategy";
import { RunGame } from "./runGame";
import { GoodStrategy } from "./goodStrategy";
import { Strategy } from "./strategy";

const g: Game = new OneDie();
const s = new RandomStrategy(g);

console.log("Starting.");

const runner = new RunGame();
const trainingStates: Float32Array[] = [];
const trainingMoves: Float32Array[] = [];
runner.collectWinData(g, s, trainingStates, trainingMoves);

console.log(`Collected ${trainingMoves.length} moves.`);

const m: ModelStrategy = new ModelStrategy(g);


function makeCanvas(strategy: Strategy) {
  const pixelData = new Uint8ClampedArray(30 * 30 * 4);
  for (let x = 0; x < 30; ++x) {
    for (let y = 0; y < 30; ++y) {
      const state = new Float32Array([x, 2, y]);
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
  const body = document.getElementsByTagName('body')[0];
  body.appendChild(canvas);
}
makeCanvas(s);
makeCanvas(m);

function loop(iterations: number) {
  if (iterations === 0) {
    console.log("Done");
    return;
  }

  m.train(trainingStates, trainingMoves).then((history) => {
    makeCanvas(m);
    const losses = history.history['loss'] as number[];
    console.log(`First loss: ${losses[0]}`);
    console.log(`Last loss: ${losses[losses.length - 1]}`);
    while (trainingStates.length > 100) {
      trainingStates.shift();
      trainingMoves.shift();
    }
    runner.collectWinData(g, s, trainingStates, trainingMoves);
    runner.collectWinData(g, m, trainingStates, trainingMoves);
    setTimeout(() => { loop(iterations - 1); });
  });
}

loop(10);
