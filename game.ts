import { Move } from "./move";
import { State } from "./state";

export interface Game {
  // Returns the number of players in this game
  getPlayerCount(): number;

  // Returns the number of floats which represent the state of the game.
  getStateSize(): number;

  // Returns the initial state of the game.
  getInitialState(): State;

  // Returns the number of floast which reprent possible moves at any state.
  getMoveSize(): number;

  // Applies the move to the state and returns the new state.
  applyMove(state: State, move: Move): State;
}