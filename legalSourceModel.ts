import * as tf from '@tensorflow/tfjs';

export class LegalSourceModel {
  private model: tf.LayersModel;
  // Builds a model which can be trained to identify where pieces can 
  // be moved from.
  private constructor(stateSize: number, sourceSize: number) {
    const input = tf.input({ shape: [stateSize] });
    const l1 = tf.layers.dense({ units: stateSize + sourceSize }).apply(input);
    const l2 = tf.layers.dense({ units: stateSize + sourceSize }).apply(l1);
    const o = tf.layers.dense({
      units: sourceSize,
      activation: 'hardSigmoid'
    }).apply(l2) as tf.SymbolicTensor;
    this.model = tf.model({ inputs: input, outputs: o });
  }

  static make(stateSize: number, sourceSize: number): Promise<LegalSourceModel> {
    return new Promise((resolve, reject) => {
      tf.setBackend('cpu').then(() => {
        resolve(new LegalSourceModel(stateSize, sourceSize));
      });
    });
  }

  getLegalSources(state: Float32Array): Promise<Float32Array> {
    const inputTensor = tf.tensor(state, [1, state.length]);
    const sourceTensor = this.model.predict(inputTensor) as tf.Tensor;
    return new Promise<Float32Array>((resolve, reject) => {
      sourceTensor.data().then((data) => {
        resolve(new Float32Array(data));
      });
    });
  }
}