export interface Game {
  getInitialState(): Float32Array;

  // Returns the number of floats which represent the state of the game.
  getStateSize(): number;
  // Returns the number of floast which reprent possible moves at any state.
  getMoveSize(): number;

  // Applies the move to the state and returns the new state.
  applyMove(state: Float32Array, move: Float32Array): Float32Array;

  // Returns true if this is a winning state.
  isWinning(state: Float32Array);

  // Returns true if this is a losing state.
  isLosing(State: Float32Array);
}