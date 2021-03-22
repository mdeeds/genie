import { LegalLocationModel } from "./legalLocationModel";

async function testBasic() {
  const llm = await LegalLocationModel.make(2, 2);

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
  console.assert(lossArray[lossArray.length - 1] < 0.01, "testBasic");
}


async function testWeighted() {
  const llm = await LegalLocationModel.make(2, 2);

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
  console.assert(lossArray[lossArray.length - 1] < 0.01, "testWeighted");
}

// TODO: Add tests for:
// 1) Use TTT game, train on ~5 examples, validate on ~100 different states.
// 2) Use TTT game, train on ~10 examples where one is wrong, assert that 
//    that one wrong example fits worse than the other nine.

testBasic();
testWeighted();

