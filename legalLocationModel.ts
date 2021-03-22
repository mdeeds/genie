import * as tf from '@tensorflow/tfjs';

// Creates a model intended for determining which locations are legal.
// This can be used for determining legal sources or legal destinations.
export class LegalLocationModel {
  private model: tf.LayersModel;
  private locationSize: number;
  private stateSize: number;
  // Builds a model which can be trained to identify where pieces can 
  // be moved from.
  private constructor(stateSize: number, locationSize: number) {
    this.locationSize = locationSize;
    this.stateSize = stateSize;
    const input = tf.input({ shape: [stateSize] });
    const inputWeight = tf.input({ shape: [locationSize] });
    const l1 = tf.layers.dense({ units: stateSize + locationSize }).apply(input);
    const l2 = tf.layers.dense({ units: stateSize + locationSize }).apply(l1);
    const o = tf.layers.dense({
      units: locationSize,
      activation: 'hardSigmoid'
    }).apply(l2) as tf.SymbolicTensor;

    const weighted_o = tf.layers.multiply()
      .apply([o, inputWeight]) as tf.SymbolicTensor;
    this.model = tf.model({ inputs: [input, inputWeight], outputs: weighted_o });

    this.model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
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
    const inputWeightTensor = tf.ones([1, this.locationSize])

    const locationTensor = this.model.predict(
      [inputTensor, inputWeightTensor]) as tf.Tensor;
    return new Promise<Float32Array>((resolve, reject) => {
      locationTensor.data().then((data) => {
        inputTensor.dispose();
        locationTensor.dispose();
        resolve(new Float32Array(data));
      });
    });
  }

  async trainAsync(states: Float32Array[], legalLocations: Float32Array[]):
    Promise<tf.History> {
    const confidenceLocations: Float32Array[] = [];
    while (confidenceLocations.length < legalLocations.length) {
      const newRow = new Float32Array(legalLocations[0].length);
      for (let i = 0; i < confidenceLocations.length; ++i) {
        newRow[i] = 1.0;
      }
      confidenceLocations.push(newRow);
    }
    return this.trainWeightedAsync(states, legalLocations, confidenceLocations);
  }

  async trainWeightedAsync(states: Float32Array[], legalLocations: Float32Array[],
    confidenceLocations: Float32Array[]): Promise<tf.History> {
    // TODO: Add some logic to cancel ongoing training if we get a new call to
    // train.
    const batchSize: number = states.length;
    if (states.length === 0) {
      throw 'Must have at least one input value.';
    }
    if (states[0].length != this.stateSize) {
      throw `Wrong state size.  ` +
      `Got ${states[0].length}, expected ${this.stateSize}`;
    }

    const x = tf.tensor(states, [batchSize, this.stateSize]);
    const legal = tf.tensor(legalLocations, [batchSize, this.locationSize]);
    const confidence = tf.tensor(confidenceLocations, [batchSize, this.locationSize]);
    const y = tf.mul(legal, confidence);
    let history: tf.History = null;
    for (let iteration = 0; iteration < 100; ++iteration) {
      history = await this.model.fit([x, confidence], y, { epochs: 5 });
      if (history.history['loss'][0] < history.history['loss'][4]) {
        // Loss is increasing, so we have stopped learning.
        break;
      }
    }
    x.dispose();
    legal.dispose();
    confidence.dispose();
    y.dispose();
    return history;
  }
}