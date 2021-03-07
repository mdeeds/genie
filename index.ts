import { ModelStrategy } from "./modelStrategy";
import { Game } from "./game";
import { OneDie } from "./oneDie";
import { RandomStrategy } from "./randomStrategy";
import { RunGame } from "./runGame";
import { GoodStrategy } from "./goodStrategy";

const g: Game = new OneDie();
const s = new GoodStrategy();

console.log("Starting.");

const runner = new RunGame();
for (let i = 0; i < 10; ++i) {
  runner.run(g, s);
}

console.log("Done.");
