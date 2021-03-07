import * as tf from '@tensorflow/tfjs';
import { Game } from './game';
import { Strategy } from './strategy';

export class ModelStrategy implements Strategy {
  private stateSize: number;
  private moveSize: number;
  private model: tf.LayersModel;


  constructor(game: Game) {
    this.stateSize = game.getStateSize();
    this.moveSize = game.getMoveSize();
    const input = tf.input({ shape: [game.getStateSize()] });

    const l1 = tf.layers.dense({ units: 2 }).apply(input);
    const l2 = tf.layers.dense({ units: 2 }).apply(l1);
    const o = tf.layers.dense({ units: game.getMoveSize() })
      .apply(l2) as tf.SymbolicTensor;

    this.model = tf.model({ inputs: input, outputs: o });
    this.model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
  }

  getMove(state: Float32Array): Float32Array {
    const inputTensor = tf.tensor(state, [1, this.stateSize]);
    const moveTensor = this.model.predict(inputTensor) as tf.Tensor;
    const move = new Float32Array(moveTensor.dataSync());
    inputTensor.dispose();
    moveTensor.dispose();
    return move;
  }

  train(states: Float32Array[], moves: Float32Array[]): Promise<tf.History> {
    const x = tf.tensor(states, [states.length, this.stateSize]);
    const y = tf.tensor(moves, [moves.length, this.moveSize]);
    return this.model.fit(x, y, { epochs: 50 });
  }
}