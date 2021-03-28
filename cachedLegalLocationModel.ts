import * as tf from '@tensorflow/tfjs';
import { VMap } from "./vMap";
import { LegalLocationModel } from "./legalLocationModel";

/***
 * This class caches training data for the model.  It is *not* a cache
 * on the returned values from the model.
 * Training data is added to the model by calling the `addExample`
 * method.  Subsequent calls to `getLegalLocations` will return
 * the value of the example regardless of the value the model might
 * produce.
 * Calling `train` will train the model on the cached examples.
 */
export class CachedLegalLocationModel {
  private base: LegalLocationModel;
  private cache: VMap<Float32Array> = new VMap();

  private constructor(base: LegalLocationModel) {
    this.base = base;
  }

  static make(stateShapes: tf.Shape[],
    locationSize: number): Promise<CachedLegalLocationModel> {
    return new Promise((resolve, reject) => {
      const base = LegalLocationModel
        .make(stateShapes, locationSize).then((llm => {
          resolve(new CachedLegalLocationModel(llm));
        }));
    });
  }

  getLegalLocations(state: Float32Array): Promise<Float32Array> {
    if (this.cache.has(state)) {
      return new Promise((resolve, reject) => {
        resolve(this.cache.get(state));
      });
    } else {
      return this.base.getLegalLocations(state);
    }
  }

  setData(state: Float32Array, locations: Float32Array) {
    this.cache.set(state, locations);
  }

  trainAsync(): Promise<tf.History> {
    if (this.cache.size() == 0) {
      return new Promise<tf.History>((resolve, reject) => {
        reject("No data.");
      });
    }
    const states: Float32Array[] = [];
    const legalLocations: Float32Array[] = [];
    for (const [k, v] of this.cache.entries()) {
      states.push(k);
      legalLocations.push(v);
    }
    return this.base.trainAsync(states, legalLocations);
  }
}