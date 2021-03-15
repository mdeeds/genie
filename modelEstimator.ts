import * as tf from '@tensorflow/tfjs';
import { Estimator } from "./estimator";
import { Game } from "./game";
import { State } from './state';

export class ModelEstimator implements Estimator {
  private stateSize: number;
  private moveSize: number;
  private model: tf.LayersModel;
  private game: Game;

  // Adding noise to the moves results in non-deterministic plays
  // when the underlying model is unsure.  This allows us to produce
  // training data for multiple options when unsure.
  private constructor(game: Game) {
    this.stateSize = game.getStateSize();
    this.moveSize = game.getMoveSize();
    this.game = game;
  }

  static make(game: Game): Promise<ModelEstimator> {
    const result = new ModelEstimator(game);
    return new Promise((resolve, reject) => {
      tf.setBackend('cpu').then(() => {
        const input = tf.input({ shape: [game.getStateSize()] });

        const l1 = tf.layers.dense({ units: 18 }).apply(input);
        const l2 = tf.layers.dense({ units: 3 }).apply(l1);
        const o = tf.layers.dense(
          { units: game.getPlayerCount(), activation: 'softmax' })
          .apply(l2) as tf.SymbolicTensor;

        result.model = tf.model({ inputs: input, outputs: o });
        result.model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
        console.log("Compiled.");
        resolve(result);
      });
    });
  }

  probabilityOfWin(states: State[]): Float32Array[] {
    const stateData: Float32Array[] = [];
    for (const s of states) {
      stateData.push(s.data);
    }

    const inputTensor = tf.tensor(stateData,
      [states.length, this.stateSize]);

    const probTensor = this.model.predict(inputTensor) as tf.Tensor;
    const probData = probTensor.dataSync();

    const result: Float32Array[] = [];
    for (let i = 0; i < states.length; ++i) {
      result.push(new Float32Array(this.game.getPlayerCount()));
      for (let j = 0; j < this.game.getPlayerCount(); ++j) {
        result[i][j] = probData[j + i * this.game.getPlayerCount()];
      }
    }

    inputTensor.dispose();
    probTensor.dispose();
    return result;
  }

  train(states: State[], winProbabilities: Float32Array[]): Promise<tf.History> {
    const x = tf.tensor(State.toDataArray(states),
      [states.length, this.stateSize]);
    const y = tf.tensor(winProbabilities,
      [winProbabilities.length, this.game.getPlayerCount()],
      'float32');
    return this.model.fit(x, y, { epochs: 100 });
  }
}