import * as tf from '@tensorflow/tfjs';

export class ModelUtil {

  static printModelWeights(model: tf.LayersModel) {
    for (const l of model.layers) {
      console.log(l.name);
      for (const w of l.weights) {
        console.log(`${w.name}: ${w.read().dataSync()}`);
      }
    }
  }
}