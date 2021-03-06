/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 138:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const oneDie_1 = __webpack_require__(175);
const randomStrategy_1 = __webpack_require__(979);
const runGame_1 = __webpack_require__(9);
const g = new oneDie_1.OneDie();
const s = new randomStrategy_1.RandomStrategy(g);
console.log("Start.");
const runner = new runGame_1.RunGame();
runner.run(g, s);
console.log("Done.");
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 175:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OneDie = void 0;
class OneDie {
    constructor(roundCount = 5, winningScore = 25) {
        this.kGoIndex = 0;
        this.kEndIndex = 1;
        this.kScoreIndex = 0;
        this.kRoundIndex = 1;
        this.kTotalScore = 2;
        this.roundCount = roundCount;
        this.winningScore = winningScore;
    }
    getInitialState() {
        return new Float32Array(3);
    }
    // [ current score, current round, totalScore]
    getStateSize() {
        return 4;
    }
    // There are two possible moves: go or end round.
    getMoveSize() {
        return 2;
    }
    getDieRoll() {
        return 1 + Math.trunc(Math.random() * 6);
    }
    applyMove(state, move) {
        const newState = new Float32Array(state);
        if (move[this.kGoIndex] > move[this.kEndIndex]) {
            // "GO" move
            const newRoll = this.getDieRoll();
            if (newRoll === 1) {
                newState[this.kScoreIndex] = 0;
                newState[this.kRoundIndex] += 1;
            }
            else {
                newState[this.kScoreIndex] += newRoll;
            }
        }
        else {
            // "End" move
            newState[this.kTotalScore] += newState[this.kScoreIndex];
            newState[this.kRoundIndex] += 1;
            newState[this.kScoreIndex] = 0;
        }
        return newState;
    }
    isWinning(state) {
        return (state[this.kRoundIndex] == this.roundCount &&
            state[this.kTotalScore] >= this.winningScore);
    }
    isLosing(state) {
        return (state[this.kRoundIndex] == this.roundCount &&
            state[this.kTotalScore] < this.winningScore);
    }
}
exports.OneDie = OneDie;
//# sourceMappingURL=oneDie.js.map

/***/ }),

/***/ 979:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RandomStrategy = void 0;
class RandomStrategy {
    constructor(g) {
        this.moveSize = g.getMoveSize();
    }
    getMove(state) {
        const move = new Float32Array(this.moveSize);
        const moveNumber = Math.trunc(Math.random() * this.moveSize);
        move[moveNumber] = 1.0;
        return move;
    }
}
exports.RandomStrategy = RandomStrategy;
//# sourceMappingURL=randomStrategy.js.map

/***/ }),

/***/ 9:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RunGame = void 0;
class RunGame {
    constructor() {
    }
    run(game, strategy) {
        let state = game.getInitialState();
        while (!game.isWinning(state) && !game.isLosing(state)) {
            const move = strategy.getMove(state);
            state = game.applyMove(state, move);
        }
        console.log(`Final result: ${game.isWinning(state)}`);
    }
}
exports.RunGame = RunGame;
//# sourceMappingURL=runGame.js.map

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__(138);
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;
//# sourceMappingURL=main.js.map