import { CachedLegalLocationModel } from "./cachedLegalLocationModel";

async function testBasic() {
  const cllm = await CachedLegalLocationModel.make([[2]], 2);

  cllm.setData(new Float32Array([0, 0]), new Float32Array([0, 1]));
  cllm.setData(new Float32Array([0, 1]), new Float32Array([1, 0]));
  cllm.setData(new Float32Array([1, 0]), new Float32Array([0, 1]));
  cllm.setData(new Float32Array([1, 1]), new Float32Array([1, 0]));

  const history = await cllm.trainAsync();

  const lossArray = history.history['loss'];
  console.log(lossArray.slice(-10));
  console.assert(lossArray[lossArray.length - 1] < 0.02, "testBasic");
}

async function run() {
  await testBasic();
  console.log("Done");
}

run();