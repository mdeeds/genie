export interface Strategy {
  getMove(state: Float32Array): Float32Array;
}