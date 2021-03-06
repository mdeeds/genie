import { Game } from "./game";
import { OneDie } from "./oneDie";
import { RandomStrategy } from "./randomStrategy";
import { RunGame } from "./runGame";

const g: Game = new OneDie();
const s = new RandomStrategy(g);

console.log("Start.");

const runner = new RunGame();
runner.run(g, s);

console.log("Done.");
