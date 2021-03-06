import { Estimator } from './estimator';
import { Game } from './game';
import { Move } from './move';
import { State } from './state';
import { Strategy } from './strategy';
// require('@tensorflow/tfjs-backend-wasm');

export class WinEstimatorStrategy implements Strategy {
  private moveSize: number;
  private game: Game;
  private estimator: Estimator;
  private moveNoise: number;

  // Adding noise to the moves results in non-deterministic plays
  // when the underlying model is unsure.  This allows us to produce
  // training data for multiple options when unsure.
  constructor(game: Game, estimator: Estimator, moveNoise: number = 0.2) {
    this.moveSize = game.getMoveSize();
    this.game = game;
    this.estimator = estimator;
    this.moveNoise = moveNoise;
  }

  getMove(state: State): Move {
    const stateData: State[] = [];
    const fatalMoves: number[] = [];
    for (let i = 0; i < this.moveSize; ++i) {
      const move = new Move(this.moveSize);
      move.data[i] = 1.0;
      const nextState = this.game.applyMove(state, move);
      if (nextState.isEnded()) {
        if (nextState.winners[state.playerIndex] > 0) {
          // Easy.  We just won.
          return move;
        } else {
          // Record this so we make sure not to do it.
          fatalMoves.push(i);
        }
      }
      stateData.push(nextState);
    }

    const move = new Move(this.moveSize);
    const moveData: Float32Array[] = this.estimator.probabilityOfWin(stateData);
    for (let i = 0; i < this.moveSize; ++i) {
      // Choose the move that gives us the highest chance of winning
      const noise = (Math.random() - 0.5) * this.moveNoise * 2;
      move.data[i] = moveData[i][state.playerIndex] + noise;
    }
    for (const f of fatalMoves) {
      move.data[f] = 0.0;
    }

    return move;
  }
}