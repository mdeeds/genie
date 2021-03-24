import * as tf from '@tensorflow/tfjs';
import { metrics } from '@tensorflow/tfjs';
import { prod } from '@tensorflow/tfjs-core';
import { activation } from '@tensorflow/tfjs-layers/dist/exports_layers';

// Creates a model intended for determining which locations are legal.
// This can be used for determining legal sources or legal destinations.
export class LegalLocationModel {
  private model: tf.LayersModel;
  private locationSize: number;
  private stateSize: number;
  private stateShapes: tf.Shape[];
  // Builds a model which can be trained to identify where pieces can 
  // be moved from.
  private constructor(stateShapes: tf.Shape[], locationSize: number) {
    this.locationSize = locationSize;
    this.stateShapes = stateShapes;
    let stateSize = 0;
    for (const s of stateShapes) {
      let product = 1;
      for (const d of s) {
        product *= d;
      }
      stateSize += product;
    }
    this.stateSize = stateSize;
    const inputs: tf.SymbolicTensor[] = [];

    for (const shape of stateShapes) {
      console.log(`AAAAA: input: ${shape}`);
      inputs.push(tf.input({ shape: shape }));
    }
    const convLayers: tf.SymbolicTensor[] = [];
    for (const input of inputs) {
      console.log(`AAAAA: input.shape: ${input.shape}`);
      if (input.shape.length === 4 &&
        (input.shape[1] > 1 || input.shape[2] > 1)) {
        const smallerDim = Math.min(input.shape[1], input.shape[2]);
        console.log(`AAAAA: Smaller dim: ${smallerDim}`);
        for (let d = 2; d < smallerDim; ++d) {
          const convLayer = tf.layers.conv2d({
            kernelSize: d, filters: 3, padding: 'same'
          }).apply(input) as tf.SymbolicTensor;
          console.log(`AAAAA Conv shape: ${convLayer.shape}`);
          convLayers.push(
            tf.layers.flatten().apply(convLayer) as tf.SymbolicTensor);
        }
      }
    }

    const flatInputs: tf.SymbolicTensor[] = [];
    for (const input of inputs) {
      flatInputs.push(tf.layers.flatten().apply(input) as tf.SymbolicTensor);
    }

    const layerArray = [...flatInputs, ...convLayers];
    console.log(`AAAAA: layerArray.length: ${layerArray.length}`);
    const flat = tf.layers.concatenate().apply(layerArray);

    const l1 = tf.layers.dense({
      units: stateSize + locationSize, activation: 'relu'
    }).apply(flat);
    const l2 = tf.layers.dense({
      units: stateSize + locationSize, activation: 'relu'
    }).apply(l1);
    const o = tf.layers.dense({
      units: locationSize,
      activation: 'sigmoid'
    }).apply(l2) as tf.SymbolicTensor;

    const inputWeight = tf.input({ shape: [locationSize] });
    const weighted_o = tf.layers.multiply()
      .apply([o, inputWeight]) as tf.SymbolicTensor;
    this.model = tf.model({ inputs: [...inputs, inputWeight], outputs: weighted_o });

    this.model.compile({ optimizer: 'adam', loss: tf.losses.sigmoidCrossEntropy, metrics: ['accuracy'] });  //loss: tf.losses.sigmoidCrossEntropy

    this.model.summary()
  }

  static make(stateShapes: tf.Shape[],
    locationSize: number): Promise<LegalLocationModel> {
    return new Promise((resolve, reject) => {
      tf.setBackend('cpu').then(() => {
        resolve(new LegalLocationModel(stateShapes, locationSize));
      });
    });
  }

  getLegalLocations(state: Float32Array): Promise<Float32Array> {
    const inputTensor = tf.tensor(state, [1, ...this.stateShapes[0]]);
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

    const x = tf.tensor(states, [batchSize, ...this.stateShapes[0]]);
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