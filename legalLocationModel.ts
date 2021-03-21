import * as tf from '@tensorflow/tfjs';

// Creates a model intended for determining which locations are legal.
// This can be used for determining legal sources or legal destinations.
export class LegalLocationModel {
  private model: tf.LayersModel;
  // Builds a model which can be trained to identify where pieces can 
  // be moved from.
  private constructor(stateSize: number, locationSize: number) {
    const input = tf.input({ shape: [stateSize] });
    const l1 = tf.layers.dense({ units: stateSize + locationSize }).apply(input);
    const l2 = tf.layers.dense({ units: stateSize + locationSize }).apply(l1);
    const o = tf.layers.dense({
      units: locationSize,
      activation: 'hardSigmoid'
    }).apply(l2) as tf.SymbolicTensor;
    this.model = tf.model({ inputs: input, outputs: o });
  }

  static make(stateSize: number, locationSize: number): Promise<LegalLocationModel> {
    return new Promise((resolve, reject) => {
      tf.setBackend('cpu').then(() => {
        resolve(new LegalLocationModel(stateSize, locationSize));
      });
    });
  }

  getLegalLocations(state: Float32Array): Promise<Float32Array> {
    const inputTensor = tf.tensor(state, [1, state.length]);
    const locationTensor = this.model.predict(inputTensor) as tf.Tensor;
    return new Promise<Float32Array>((resolve, reject) => {
      locationTensor.data().then((data) => {
        resolve(new Float32Array(data));
      });
    });
  }
}