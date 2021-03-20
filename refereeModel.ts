import { Move } from "./move";
import { MoveStatePair } from "./moveStatePair";
import { State } from "./state";

export class RefereeModel {
  constructor(stateSize: number, moveSize: number) {
  }

  // Initiates training the referee.  Training completes when all moves are
  // correctly classified.
  trainAsync(legal: MoveStatePair, illegal: MoveStatePair): Promise<boolean> {
    return new Promise((resolve, reject) => {
      reject("Not implemented.");
    });
  }


  // Moves must be zero (illegal) or one (legal).
  // Missing classifications is indicated with the `confidence`
  // vector.  This vector is the same size as the move vector
  // and has a one if the label is high confidence, or zero if
  // the label should be ignored.
  // We use this in the loss function so that only moves with
  // confidence contribute to the loss.
  private trainRawAsync(states: Float32Array[], moves: Float32Array[],
    confidence: Float32Array[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      reject('Not implemented.');
    });
  }

  getLegalMoves(states: State[]): Move[] {
    return [];
  }
}