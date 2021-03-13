import { Strategy } from "./strategy";
import { OneDie } from "./oneDie";
import { State } from "./state";
import { Move } from "./move";

export class GoodStrategy implements Strategy {
  private game: OneDie;
  constructor(game: OneDie) {
    this.game = game;
  }

  getMove(state: State): Move {
    const move = new Move(this.game.getMoveSize());
    if (state.data[OneDie.kScoreIndex] >= 12 ||
      state.data[OneDie.kTotalScore] + state.data[OneDie.kScoreIndex] > 25) {
      move.data[OneDie.kEndIndex] = 1.0;
    } else {
      move.data[OneDie.kGoIndex] = 1.0;
    }
    return move;
  }
}