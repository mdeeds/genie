import { Game } from "./game";
import { Strategy } from "./strategy";

export class RunGame {
  constructor() {
  }

  run(game: Game, strategy: Strategy) {
    let state = game.getInitialState();
    while (!game.isWinning(state) && !game.isLosing(state)) {
      const move = strategy.getMove(state);
      state = game.applyMove(state, move);
    }
    console.log(`Final result: ${game.isWinning(state)}`);
  }
}