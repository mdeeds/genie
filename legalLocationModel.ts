import * as tf from '@tensorflow/tfjs';
import { Log } from './log';

// Creates a model intended for determining which locations are legal.
// This can be used for determining legal sources or legal destinations.
export class LegalLocationModel {
  private model: tf.LayersModel;
  private locationSize: number;
  private stateSize: number;
  private stateShapes: tf.Shape[] = [];
  private stateOffsets: number[] = [];
  private stateSizes: number[] = [];
  public epochs: number;
  private modelLevel = 1;
  // Builds a model which can be trained to identify where pieces can 
  // be moved from.
  private constructor(stateShapes: tf.Shape[], locationSize: number, lr: number) {
    this.locationSize = locationSize;
    this.stateShapes = stateShapes;
    let stateSize = 0;
    for (const s of stateShapes) {
      this.stateOffsets.push(stateSize);
      let product = 1;
      for (const d of s) {
        product *= d;
      }
      this.stateSizes.push(product);
      stateSize += product;
    }
    this.stateSize = stateSize;

    this.buildModel(stateShapes, locationSize, lr);


  }

  private buildModel(stateShapes: tf.Shape[], locationSize: number, lr: number = 0.01) {
    const inputs: tf.SymbolicTensor[] = [];
    for (const shape of stateShapes) {
      Log.debug(`input: ${shape}`);
      inputs.push(tf.input({ shape: shape }));
    }
    const numberOfLayers = Math.min(Math.ceil(this.modelLevel / 9), 3);
    const numberOfFilters = this.modelLevel;
    Log.debug(`numberOfLayers: ${numberOfLayers}`);
    Log.debug(`numberOfFilters: ${numberOfFilters}`);

    const convLayers: tf.SymbolicTensor[] = [];
    const nonConvLayers: tf.SymbolicTensor[] = [];
    for (const input of inputs) {
      Log.debug(`input.shape: ${input.shape}`);
      if (input.shape.length === 4 &&
        (input.shape[1] > 1 || input.shape[2] > 1)) {
        const smallerDim = Math.min(input.shape[1], input.shape[2]);
        const kernelSize = Math.ceil(this.modelLevel / 3) % smallerDim + 1;
        Log.debug(`kernelSize: ${kernelSize}`);
        Log.debug(`Smaller dim: ${smallerDim}`);
        // for (let d = 1; d <= smallerDim; ++d) {
        var x = input;
        for (const d of [1]) {
          for (var l = 0; l < numberOfLayers; l++) {
            var x = tf.layers.conv2d({
              kernelSize: kernelSize, filters: numberOfFilters,
              padding: 'same',
              activation: 'relu',
            }).apply(x) as tf.SymbolicTensor;
          }
          x = tf.layers.conv2d({
            kernelSize: d, filters: 1, padding: 'same',
            activation: 'sigmoid'
          }).apply(x) as tf.SymbolicTensor;
          Log.debug(`Conv shape: ${x.shape}`);
          convLayers.push(this.makeFlat(x));
        }
      } else {
        const f = this.makeFlat(input);
        const d = tf.layers.dense({
          units: this.modelLevel, activation: 'relu' //units: f.shape[1], activation: 'relu'
        }).apply(f) as tf.SymbolicTensor;
        nonConvLayers.push(d);
      }
    }

    const flatInputs: tf.SymbolicTensor[] = [];
    for (const input of inputs) {
      flatInputs.push(this.makeFlat(input));
    }
    Log.debug(`nonCovCount: ${nonConvLayers.length}`);
    Log.debug(`convCount: ${convLayers.length}`);
    const layerArray = [...nonConvLayers, ...convLayers];
    let flat: tf.SymbolicTensor;
    Log.debug(`layerLength: ${layerArray.length}`);
    if (layerArray.length === 1) {
      flat = layerArray[0];
    } else {
      flat = tf.layers.concatenate().apply(layerArray) as tf.SymbolicTensor;
    }
    let o = flat;

    if (flat.shape[1] != locationSize) {
      o = tf.layers.dense({
        units: locationSize,
        //activation: 'sigmoid'
      }).apply(flat) as tf.SymbolicTensor;
    }
    Log.debug(`o shape: ${o.shape}`);

    const inputWeight = tf.input({ shape: [locationSize] });
    const weighted_o = tf.layers.multiply()
      .apply([o, inputWeight]) as tf.SymbolicTensor;
    this.model = tf.model({
      inputs: [...inputs, inputWeight],
      outputs: weighted_o
    });

    let opt = tf.train.adam(lr);

    function customLoss(yPred, yTrue) {
      return tf.mean(tf.square(tf.maximum(tf.sub(yPred, yTrue), 0.000001)));
      //return yPred.add(yTrue).mean();
    }

    this.model.compile({
      optimizer: opt, loss: tf.losses.meanSquaredError, //tf.losses.meanSquaredError, // customLoss
      metrics: ['accuracy', 'binaryAccuracy', 'categoricalAccuracy']
    });

    //this.model.summary(null, null, Log.debug);
  }

  private makeFlat(x: tf.SymbolicTensor): tf.SymbolicTensor {
    if (x.shape.length < 3) {
      return x;
    } else {
      return tf.layers.flatten().apply(x) as tf.SymbolicTensor;
    }
  }

  getModel() {
    return this.model;
  }

  static make(stateShapes: tf.Shape[],
    locationSize: number, lr: number = 0.01): Promise<LegalLocationModel> {
    return new Promise((resolve, reject) => {
      tf.setBackend('cpu').then(() => {
        resolve(new LegalLocationModel(stateShapes, locationSize, lr));
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

    const inputTensors: tf.Tensor[] = [];
    for (let shapeIndex = 0;
      shapeIndex < this.stateOffsets.length;
      ++shapeIndex) {
      const flatData: number[] = [];
      for (let exampleIndex = 0; exampleIndex < states.length; ++exampleIndex) {
        const slice = states[exampleIndex].slice(
          this.stateOffsets[shapeIndex],
          this.stateOffsets[shapeIndex] + this.stateSizes[shapeIndex]);
        flatData.push(...slice);
      }
      inputTensors.push(
        tf.tensor(flatData,
          [batchSize, ...this.stateShapes[shapeIndex]]));
    }

    const legal = tf.tensor(legalLocations, [batchSize, this.locationSize]);
    const confidence = tf.tensor(confidenceLocations, [batchSize, this.locationSize]);
    const y = tf.mul(legal, confidence);
    let history: tf.History = null;



    // function onEpochEnd(epoch, logs) {
    //   if ((this.bestLoss - logs.loss < 1E-7) || logs.acc > 0.99) {
    //     console.log(this.model);
    //     //this.model.stopTraining = true;
    //     console.log(this.bestLoss, logs.loss, epoch, logs.acc)
    //   }
    //   this.bestLoss = Math.min(logs.loss, this.bestLoss);
    // }
    // class EarlyStoppingAtMinLoss extends tf.callbacks.Callback {

    //   public on_epoch_end(epoch, logs) {
    //     this.model.stop_training = true;
    // let current = logs.get("loss")
    // if np.less(current, self.best):
    //     self.best = current
    //     self.wait = 0
    //     # Record the best weights if current results is better (less).
    //     self.best_weights = self.model.get_weights()
    // else:
    //     self.wait += 1
    //     if self.wait >= self.patience:
    //         self.stopped_epoch = epoch
    //         self.model.stop_training = True
    //         print("Restoring model weights from the end of the best epoch.")
    //         self.model.set_weights(self.best_weights)
    //}


    // def on_train_end(self, logs=None):
    //     if self.stopped_epoch > 0:
    //         print("Epoch %05d: early stopping" % (self.stopped_epoch + 1))
    //}

    function myCallbacks() {
      return tf.callbacks.earlyStopping({ monitor: 'loss', patience: 100 })
    }
    let badfit = true;
    while (badfit) {
      let t0 = Date.now();
      let fitting = true;
      let bestLoss: number = 9999;
      var accuracy;
      this.epochs = 0;
      while (fitting) {
        history = await this.model.fit(
          [...inputTensors, confidence], y, { epochs: 1 }); //, callbacks: myCallbacks()
        let loss = Number(history.history.loss[history.history.loss.length - 1]);
        this.epochs++;
        accuracy = history.history.acc[history.history.acc.length - 1];
        // console.log(`loss=${loss} bestLoss=${bestLoss}`);
        if (((loss + 1E-9) > bestLoss) && (accuracy > 0.99)) {
          fitting = false;
          //log(`${loss} > ${bestLoss}`);
          //console.log(`accuracy ${accuracy}`);
        }
        bestLoss = Math.min(loss, bestLoss);
        if (this.epochs >= 1000) {
          fitting = false;
          `epochs ${this.epochs}`
        }
      }
      let fitTime = Date.now() - t0;
      //console.log(`It took ${fitTime} ms for ${this.epochs} epochs of ${batchSize} training examples.`);
      if (accuracy < 0.99) {
        this.modelLevel++;
        //console.log(`after ${this.epochs} epochs, the accuracy is ${history.history.acc[history.history.acc.length - 1]}. Increasing to model level ${this.modelLevel}.`);
        this.buildModel(this.stateShapes, this.locationSize);
      }
      else {
        badfit = false;
      }
    }


    for (const x of inputTensors) {
      x.dispose();
    }
    legal.dispose();
    confidence.dispose();
    y.dispose();
    return history;
  }
}