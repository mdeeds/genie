import { CachedLegalLocationModel } from "./cachedLegalLocationModel";

async function testBasic() {
  const cllm = await CachedLegalLocationModel.make([[2]], 2);

  cllm.addData(new Float32Array([0, 0]), new Float32Array([0, 1]));
  cllm.addData(new Float32Array([0, 1]), new Float32Array([1, 0]));
  cllm.addData(new Float32Array([1, 0]), new Float32Array([0, 1]));
  cllm.addData(new Float32Array([1, 1]), new Float32Array([1, 0]));

  const history = await cllm.trainAsync();

  const lossArray = history.history['loss'];
  console.log(lossArray);
  console.assert(lossArray[lossArray.length - 1] < 0.02, "testBasic");
}

async function run() {
  await testBasic();
  console.log("Done");
}

run();