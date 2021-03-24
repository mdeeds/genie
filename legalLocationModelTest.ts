import { activation } from "@tensorflow/tfjs-layers/dist/exports_layers";
import { LegalLocationModel } from "./legalLocationModel";

async function testBasic() {
  const llm = await LegalLocationModel.make([[2]], 2);

  const states: Float32Array[] = [];
  states.push(new Float32Array([0, 0]));
  states.push(new Float32Array([0, 1]));
  states.push(new Float32Array([1, 0]));
  states.push(new Float32Array([1, 1]));

  const legalLocations: Float32Array[] = [];
  legalLocations.push(new Float32Array([0, 1]));
  legalLocations.push(new Float32Array([1, 0]));
  legalLocations.push(new Float32Array([0, 1]));
  legalLocations.push(new Float32Array([1, 0]));

  const history = await llm.trainAsync(states, legalLocations);

  const lossArray = history.history['loss'];
  console.log(lossArray);
  console.assert(lossArray[lossArray.length - 1] < 0.02, "testBasic");
}


async function testWeighted() {
  const llm = await LegalLocationModel.make([[2]], 2);

  const states: Float32Array[] = [];
  states.push(new Float32Array([0, 0]));
  states.push(new Float32Array([0, 1]));
  states.push(new Float32Array([1, 0]));
  states.push(new Float32Array([1, 1]));

  const legalLocations: Float32Array[] = [];
  legalLocations.push(new Float32Array([0, 1]));
  legalLocations.push(new Float32Array([1, 0]));
  legalLocations.push(new Float32Array([9, 1]));  // Filtered out below
  legalLocations.push(new Float32Array([1, 0]));

  const confidenceLocations: Float32Array[] = [];
  confidenceLocations.push(new Float32Array([1, 1]));
  confidenceLocations.push(new Float32Array([1, 1]));
  confidenceLocations.push(new Float32Array([0, 1]));  // Bogus data
  confidenceLocations.push(new Float32Array([1, 1]));


  const history = await llm.trainWeightedAsync(
    states, legalLocations, confidenceLocations);

  const lossArray = history.history['loss'];
  console.log(lossArray);
  console.assert(lossArray[lossArray.length - 1] < 0.02, "testWeighted");
}

function percentile(a: number[], percentile: number): number {
  var temp: number[] = a.slice();
  temp.sort();
  var index: number = Math.round(temp.length * percentile);
  //console.log(index);
  //console.log(temp.length)
  return temp[index];
}

function RandomExamples(states: Float32Array[], legalLocations: Float32Array[], numExamples: number) {
  for (let i = 0; i < numExamples; i++) {
    var currentState: Float32Array = new Float32Array(18);
    var currentLegalLocation: Float32Array = new Float32Array(9);
    for (let j = 0; j < 9; j++) {
      let randomNumber = Math.random();
      if (randomNumber < 0.3) {
        currentState[j + 9] = 1;
      }
      else if (randomNumber < 0.6) {
        currentState[j] = 1;
      }
      else {
        currentLegalLocation[j] = 1;
      }
    }
    states.push(currentState);
    legalLocations.push(currentLegalLocation);
  }
}

async function validate(llm: LegalLocationModel, states: Float32Array[], legalLocations: Float32Array[]) {
  let right = 0
  let wrong = 0
  let unsure = 0;
  let deltas: number[] = [];
  for (let i = 0; i < states.length; i++) {
    const sources = await llm.getLegalLocations(states[i]);
    const ll = legalLocations[i];
    console.assert(sources.length == ll.length, "Length mismatch.");
    for (let j = 0; j < sources.length; ++j) {
      const delta = (Math.abs(ll[j] - sources[j]));
      deltas.push(delta);
      if (delta < 0.2) {
        ++right;
      } else if (delta < 0.8) {
        ++unsure;
      } else {
        ++wrong;
      }
    }
  }

  // console.log(`min: ${Math.min(...deltas)}`);
  // console.log(`p10: ${percentile(deltas, 0.1)}`);
  // console.log(`p20: ${percentile(deltas, 0.2)}`);
  // console.log(`p30: ${percentile(deltas, 0.3)}`);
  // console.log(`p40: ${percentile(deltas, 0.4)}`);
  // console.log(`p50: ${percentile(deltas, 0.5)}`);
  // console.log(`p60: ${percentile(deltas, 0.6)}`);
  // console.log(`p70: ${percentile(deltas, 0.7)}`);
  // console.log(`p80: ${percentile(deltas, 0.8)}`);
  // console.log(`p90: ${percentile(deltas, 0.9)}`);
  // console.log(`p91: ${percentile(deltas, 0.91)}`);
  // console.log(`p92: ${percentile(deltas, 0.92)}`);
  // console.log(`p93: ${percentile(deltas, 0.93)}`);
  // console.log(`p94: ${percentile(deltas, 0.94)}`);
  // console.log(`p95: ${percentile(deltas, 0.95)}`);
  // console.log(`p96: ${percentile(deltas, 0.96)}`);
  // console.log(`p97: ${percentile(deltas, 0.97)}`);
  // console.log(`p98: ${percentile(deltas, 0.98)}`);
  // console.log(`p99: ${percentile(deltas, 0.99)}`);
  // console.log(`max: ${Math.max(...deltas)}`);

  // console.log(`Right: ${right}`);
  // console.log(`Unsure: ${unsure}`);
  // console.log(`Wrong: ${wrong}`);
  console.log(`${right},${unsure},${wrong}`);
  return { right, unsure, wrong };
}

async function confidence(llm: LegalLocationModel, states: Float32Array[]) {
  let confidences: number[] = [];
  for (let i = 0; i < states.length; i++) {
    const sources = await llm.getLegalLocations(states[i]);
    var confidence: number = 0;
    for (let j = 0; j < sources.length; ++j) {
      confidence += Math.abs(0.5 - sources[j]);
    }
    confidence /= sources.length;
    confidences.push(confidence);
  }
  return confidences;
}

async function test5val100() {
  // to simplify just a little, I'm not counting the token bags
  // state vecor is 2 types of tokens in 9 spots = 18 features in length
  // legal locations vector is the 9 spots
  const llm = await LegalLocationModel.make([[3, 3, 2]], 9);
  const states: Float32Array[] = [];
  const legalLocations: Float32Array[] = [];
  RandomExamples(states, legalLocations, 10000);

  const history = await llm.trainAsync(
    states.slice(0, 10), legalLocations.slice(0, 10));
  console.log(history.history);
  const accArray = history.history['acc'];

  let right = 0
  let wrong = 0
  let unsure = 0;
  ({ right, unsure, wrong } = await validate(llm, states, legalLocations));

  console.assert(wrong === 0, "Has misclasifications");
  console.assert(right > unsure, "Poor clasification");
}

async function testItterative() {
  // to simplify just a little, I'm not counting the token bags
  // state vecor is 2 types of tokens in 9 spots = 18 features in length
  // legal locations vector is the 9 spots

  const llm = await LegalLocationModel.make([[3, 3, 2]], 9);
  const states: Float32Array[] = [];
  const legalLocations: Float32Array[] = [];
  RandomExamples(states, legalLocations, 10000);

  const trainingStates: Float32Array[] = [];
  const trainningLegalLocations: Float32Array[] = [];
  let right = 0
  let wrong = 0
  let unsure = 0;
  for (let i = 0; i < 100; i++) {
    // find the most unclear example
    var confidences = await confidence(llm, states);
    let temp = confidences.slice()
    temp.sort();
    let lowest = Math.min(...temp)
    let index = confidences.indexOf(lowest);
    //var index = Math.floor(Math.random() * states.length);

    trainingStates.push(states[index]);
    trainningLegalLocations.push(legalLocations[index]);
    states.splice(index, 1);
    legalLocations.splice(index, 1);

    // train with the most unsure
    const history = await llm.trainAsync(
      trainingStates, trainningLegalLocations);

    // validate model
    ({ right, unsure, wrong } = await validate(llm, states, legalLocations));
  }


  console.assert(wrong === 0, "Has misclasifications");
  console.assert(right > unsure, "Poor clasification");
}

// TODO: Add tests for:
// 1) Use TTT game, train on ~5 examples, validate on ~100 different states.
//    We don't need 100% accuracy on validation, but the wrong ones need to be
//    less than ~80% confidence - enough to flag for the user to review.
// 2) Use TTT game, train on ~10 examples where one is wrong, assert that 
//    that one wrong example fits worse than the other nine.


//testBasic();
// testWeighted();
//test5val100();
testItterative();

