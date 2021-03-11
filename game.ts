import { Move } from "./move";
import { State } from "./state";

export interface Game {
  getInitialState(): State;

  // Returns the number of players in this game
  getPlayerCount(): number;

  // Returns the number of floats which represent the state of the game.
  getStateSize(): number;
  // Returns the number of floast which reprent possible moves at any state.
  getMoveSize(): number;

  // Applies the move to the state and returns the new state.
  applyMove(state: State, move: Move): State;

  // Returns number of player who won or -1 if no winner.
  getWinner(state: State);

  // Returns true if the game is over.  A game can end with no winner.
  isEnded(state: State);
}