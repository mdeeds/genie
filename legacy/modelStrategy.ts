import * as tf from '@tensorflow/tfjs';
import { Game } from './game';
import { Move } from './move';
import { State } from './state';
import { Strategy } from './strategy';
// require('@tensorflow/tfjs-backend-wasm');

export class ModelStrategy implements Strategy {
  private stateSize: number;
  private moveSize: number;
  private model: tf.LayersModel;
  private moveNoise: number;

  // Adding noise to the moves results in non-deterministic plays
  // when the underlying model is unsure.  This allows us to produce
  // training data for multiple options when unsure.
  constructor(game: Game, moveNoise = 0.05) {
    this.stateSize = game.getStateSize();
    this.moveSize = game.getMoveSize();
    this.moveNoise = moveNoise;
    tf.setBackend('cpu').then(() => {
      const input = tf.input({ shape: [game.getStateSize()] });

      const l1 = tf.layers.dense({ units: 2 }).apply(input);
      const l2 = tf.layers.dense({ units: 2 }).apply(l1);
      const o = tf.layers.dense({
        units: game.getMoveSize(),
        activation: 'hardSigmoid',
      }).apply(l2) as tf.SymbolicTensor;

      this.model = tf.model({ inputs: input, outputs: o });
      this.model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
      console.log("Compiled.");
    })
  }

  getMove(state: State): Move {
    const inputTensor = tf.tensor(state.data, [1, this.stateSize]);
    const moveTensor = this.model.predict(inputTensor) as tf.Tensor;

    const move = new Move(this.moveSize);
    const moveData: tf.TypedArray = moveTensor.dataSync();
    for (let i = 0; i < moveData.length; ++i) {
      move.data[i] = moveData[i] + (Math.random() - 0.5) * this.moveNoise;
    }
    inputTensor.dispose();
    moveTensor.dispose();
    return move;
  }

  train(states: State[], moves: Move[]): Promise<tf.History> {
    const x = tf.tensor(State.toDataArray(states),
      [states.length, this.stateSize]);
    const y = tf.tensor(Move.toDataArray(moves),
      [moves.length, this.moveSize]);
    return this.model.fit(x, y, { epochs: 10 });
  }
}