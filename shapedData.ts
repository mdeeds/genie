export class ShapedData {
  shape: number[];
  data: Float32Array;
  constructor(shape: number[]) {
    this.shape = shape;
    let product = 1;
    for (const d of shape) {
      product *= d;
    }
    this.data = new Float32Array(product);
  }
}