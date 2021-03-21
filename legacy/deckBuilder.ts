import { Game } from "./game";
import { Move } from "./move";
import { State } from "./state";

export class DeckBuilder implements Game {
  static kCardValues = [1, 2, 4, 8];
  static kDrawnCards = 5; // 6 and 7
  static kDrawScore = 8;
  static kScore = 9;

  static kBuyMove = 0;
  static kScrapMove = 1;
  static kScoreMove = 2;

  getPlayerCount() {
    return 1;
  }

  // 1, 2, 4, 8 count in deck
  // card total
  getStateSize() {
    return 10;
  }

  getInitialState() {
    const state = new State(this.getStateSize(), 0, this.getPlayerCount());
    // Starting deck has 3 'one' cards
    // And you start by drawing the three ones.
    state.data[0] = 3;
    state.data[DeckBuilder.kDrawScore] = 3;
    state.data[DeckBuilder.kDrawnCards + 0] = 1;
    state.data[DeckBuilder.kDrawnCards + 1] = 1;
    state.data[DeckBuilder.kDrawnCards + 2] = 1;
    return state;
  }

  // Buy, Scrap, Score
  getMoveSize() {
    return 3;
  }

  applyMove(state: State, move: Move): State {
    const nextState = state.clone();
    switch (move.getLargestIndex()) {
      case DeckBuilder.kScoreMove:
        nextState.data[DeckBuilder.kScore] +=
          nextState.data[DeckBuilder.kDrawScore];
        break;
      case DeckBuilder.kScrapMove:
        // TODO, find corresponding locations in the deck
        // Decrement these.
        break;
      case DeckBuilder.kBuyMove:
        //TODO: find the most expensive card we can buy
        // add it to deck.
        break;
    }

    // TODO lose immediately if there are fewer than 3 cards in the deck
    // TODO win immediately if 50 points or more
    // TODO lose immediately if 15 rounds or more
    // TODO: Draw the cards

    nextState.data[DeckBuilder.kDrawScore] =
      nextState.data[DeckBuilder.kDrawnCards + 0] +
      nextState.data[DeckBuilder.kDrawnCards + 1] +
      nextState.data[DeckBuilder.kDrawnCards + 2];

    return nextState;
  }


}