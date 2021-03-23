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

async function test5val100() {
  // to simplify just a little, I'm not counting the token bags
  // state vecor is 2 types of tokens in 9 spots = 18 features in length
  // legal locations vector is the 9 spots

  const llm = await LegalLocationModel.make(18, 9);
  const states: Float32Array[] = [];
  const legalLocations: Float32Array[] = [];
  for (let i = 0; i < 100; i++) {
    var currentState: Float32Array = new Float32Array(18);
    var currentLegalLocation: Float32Array = new Float32Array(9);
    for (let j = 0; j < 9; j++) {
      let randomNumber = Math.random();
      if (randomNumber < 0.3) {
        currentState[j] = 0;
        currentState[j + 9] = 1;
        currentLegalLocation[j] = 0;
      }
      else if (randomNumber < 0.6) {
        currentState[j] = 1;
        currentState[j + 9] = 0;
        currentLegalLocation[j] = 0;
      }
      else {
        currentState[j] = 0;
        currentState[j + 9] = 0;
        currentLegalLocation[j] = 1;
      }
    }
    states.push(currentState);
    legalLocations.push(currentLegalLocation);
  }
  console.log(states.length);
  console.log(states[0].length);
  console.log(legalLocations.length);
  console.log(legalLocations[0].length);
  const history = await llm.trainAsync(states, legalLocations);
  console.log(history.history);
  const accArray = history.history['acc'];


  // let right = 0
  // let wrong = 0
  // for (let i = 0; i < states.length; i++) {
  //   llm.getLegalLocations(states[i]).then((sources) => {
  //     for (let j = 0; j < 9; j++) {
  //       let isAToken = false;
  //       if ((states[i][j] + states[i][j + 9]) > 1)
  //         isAToken = true;
  //       let isFree = (sources[j] > 0.5);
  //       if (isAToken !== isFree) {
  //         right++;
  //       }
  //       else {
  //         wrong++;
  //       }
  //     }
  //     console.log(right)
  //     console.log(wrong)
  //   });
  // }
  // console.log(right)
  // console.log(wrong)

  console.assert(accArray[accArray.length - 1] > 0.999, "testBasic");
}

// TODO: Add tests for:
// 1) Use TTT game, train on ~5 examples, validate on ~100 different states.
//    We don't need 100% accuracy on validation, but the wrong ones need to be
//    less than ~80% confidence - enough to flag for the user to review.
// 2) Use TTT game, train on ~10 examples where one is wrong, assert that 
//    that one wrong example fits worse than the other nine.



//testBasic();
// testWeighted();
test5val100();
