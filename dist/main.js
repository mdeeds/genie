/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 138:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const runTicTacToe_1 = __webpack_require__(848);
runTicTacToe_1.RunTicTacToe.run();
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 553:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Move = void 0;
class Move {
    constructor(dataSize) {
        this.data = new Float32Array(dataSize);
    }
    static toDataArray(moves) {
        const data = [];
        for (const m of moves) {
            for (const x of m.data) {
                data.push(x);
            }
        }
        return data;
    }
}
exports.Move = Move;
//# sourceMappingURL=move.js.map

/***/ }),

/***/ 979:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RandomStrategy = void 0;
const move_1 = __webpack_require__(553);
class RandomStrategy {
    constructor(g) {
        this.moveSize = g.getMoveSize();
    }
    getMove(state) {
        const move = new move_1.Move(this.moveSize);
        const moveNumber = Math.trunc(Math.random() * this.moveSize);
        move.data[moveNumber] = 1.0;
        return move;
    }
}
exports.RandomStrategy = RandomStrategy;
//# sourceMappingURL=randomStrategy.js.map

/***/ }),

/***/ 9:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RunGame = void 0;
const move_1 = __webpack_require__(553);
const snacks_1 = __webpack_require__(690);
class RunGame {
    constructor() {
        this.snacks = new snacks_1.Snacks();
    }
    oneHotMove(move) {
        let maxValue = -1000;
        let maxIndex = 0;
        const result = new move_1.Move(move.data.length);
        for (let i = 0; i < move.data.length; ++i) {
            result[i] = (0.1 / (move.data.length - 1));
            if (move.data[i] > maxValue) {
                maxValue = move.data[i];
                maxIndex = i;
            }
        }
        result.data[maxIndex] = 0.9;
        return result;
    }
    // Runs the game, returns the player number who won or -1 if there is
    // no winner.
    run(game, strategies) {
        const states = [];
        const moves = [];
        while (states.length < game.getPlayerCount()) {
            states.push([]);
            moves.push([]);
        }
        console.assert(game.getPlayerCount() === strategies.length);
        let state = game.getInitialState();
        let currentPlayer = 0;
        while (!state.isEnded()) {
            const move = strategies[currentPlayer].getMove(state);
            states[currentPlayer].push(state);
            moves[currentPlayer].push(this.oneHotMove(move));
            state = game.applyMove(state, move);
            currentPlayer = (currentPlayer + 1) % game.getPlayerCount();
        }
        const winner = state.winner;
        return winner;
    }
    collectWinData(game, strategies) {
        const startTime = window.performance.now();
        let winCount = 0;
        const gameCount = 1000;
        for (let i = 0; i < gameCount; ++i) {
            const winner = this.run(game, strategies);
            if (winner >= 0) {
                ++winCount;
            }
        }
        const elapsedSeconds = (window.performance.now() - startTime) / 1000;
        console.log(`Running time: ${elapsedSeconds}`);
        return winCount / gameCount;
    }
    getSnacks() {
        return this.snacks;
    }
}
exports.RunGame = RunGame;
//# sourceMappingURL=runGame.js.map

/***/ }),

/***/ 848:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RunTicTacToe = void 0;
const randomStrategy_1 = __webpack_require__(979);
const runGame_1 = __webpack_require__(9);
const ticTacToe_1 = __webpack_require__(145);
class RunTicTacToe {
    static run() {
        const g = new ticTacToe_1.TicTacToe();
        const s = new randomStrategy_1.RandomStrategy(g);
        const runner = new runGame_1.RunGame();
        for (let i = 0; i < 100; ++i) {
            runner.collectWinData(g, [s, s]);
        }
    }
}
exports.RunTicTacToe = RunTicTacToe;
//# sourceMappingURL=runTicTacToe.js.map

/***/ }),

/***/ 690:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Snacks = void 0;
const move_1 = __webpack_require__(553);
class Snack {
    constructor(state, move) {
        this.kBaseWinRate = 0.5;
        this.kAlpha = 6.0;
        this.state = state;
        this.move = move;
        this.gameCount = 0;
        this.winCount = 0;
    }
    getWinRate() {
        return (this.winCount + this.kAlpha * this.kBaseWinRate) /
            (this.gameCount + this.kAlpha);
    }
}
class Snacks {
    constructor() {
        this.allSnacks = new Map();
        this.snacksByState = new Map();
    }
    getStateKey(state) {
        return `${JSON.stringify(state.data)}:${state.playerIndex}`;
    }
    getSnackKey(state, move) {
        return `${JSON.stringify(state.data)}:${state.playerIndex}:${move.data}`;
    }
    // Adds state+move to this set of Snacks.  If the snack already exists,
    // it is updated.
    addSnack(state, move, leadsToWin) {
        const key = this.getSnackKey(state, move);
        let snack = null;
        if (this.allSnacks.has(key)) {
            snack = this.allSnacks.get(key);
        }
        else {
            snack = new Snack(state, move);
            this.allSnacks.set(key, snack);
            const stateKey = this.getStateKey(state);
            let snackList = [];
            if (this.snacksByState.has(stateKey)) {
                snackList = this.snacksByState.get(stateKey);
            }
            else {
                this.snacksByState.set(stateKey, snackList);
            }
            snackList.push(snack);
        }
        snack.gameCount++;
        if (leadsToWin) {
            snack.winCount++;
        }
    }
    getIndexOfMax(a) {
        let indexOfMax = 0;
        let maxValue = a[0];
        for (let i = 1; i < a.length; ++i) {
            if (a[i] > maxValue) {
                maxValue = a[i];
                indexOfMax = i;
            }
        }
        return indexOfMax;
    }
    // Produces a state-move pair for every known state.
    // The values in the move are not indicators (i.e. 1 or 0) they are 
    // the calculated probability of winning from the state we get to
    // when applying the move.
    getMoveVectors(outStates, outMoves) {
        for (const snackList of this.snacksByState.values()) {
            const state = snackList[0].state;
            const move = new move_1.Move(snackList[0].move.data.length);
            for (let i = 0; i < move.data.length; ++i) {
                move.data[i] = 0.5;
            }
            for (const snack of snackList) {
                move[this.getIndexOfMax(snack.move.data)] = snack.getWinRate();
            }
            outStates.push(state);
            outMoves.push(move);
        }
    }
}
exports.Snacks = Snacks;
//# sourceMappingURL=snacks.js.map

/***/ }),

/***/ 800:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.State = void 0;
class State {
    constructor(dataSize, playerIndex, winner = -1) {
        this.playerIndex = playerIndex;
        this.data = new Float32Array(dataSize);
        this.winner = winner;
    }
    static toDataArray(states) {
        const data = [];
        for (const s of states) {
            for (const x of s.data) {
                data.push(x);
            }
        }
        return data;
    }
    isEnded() {
        return this.winner >= 0;
    }
}
exports.State = State;
//# sourceMappingURL=state.js.map

/***/ }),

/***/ 145:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TicTacToe = void 0;
const state_1 = __webpack_require__(800);
class TicTacToe {
    getPlayerCount() {
        return 2;
    }
    getStateSize() {
        return 18;
    }
    getInitialState() {
        return new state_1.State(this.getStateSize(), 0);
    }
    getMoveSize() {
        return 9;
    }
    getLargestIndex(move) {
        let largestValue = move.data[0];
        let largestIndex = 0;
        for (let i = 1; i < move.data.length; ++i) {
            if (move.data[i] > largestValue) {
                largestValue = move.data[i];
                largestIndex = i;
            }
        }
        return largestIndex;
    }
    copyState(source, destination) {
        for (let i = 0; i < this.getStateSize(); ++i) {
            destination[i] = source[i];
        }
    }
    checkForWin(offset, stateData) {
        for (let i = 0; i < 3; ++i) {
            let numInRow = 0;
            let numInCol = 0;
            for (let j = 0; j < 3; ++j) {
                numInRow += stateData[offset + i + j * 3];
                numInCol += stateData[offset + j + i * 3];
            }
            if (numInRow > 2.5 || numInCol > 2.5) {
                return true;
            }
        }
        if (stateData[offset] +
            stateData[offset + 4] +
            stateData[offset + 8] > 2.5) {
            return true;
        }
        if (stateData[offset + 2] +
            stateData[offset + 4] +
            stateData[offset + 6] > 2.5) {
            return true;
        }
        return false;
    }
    applyMove(state, move) {
        const offset = 9 * state.playerIndex;
        const i = this.getLargestIndex(move);
        const nextPlayer = state.playerIndex ^ 0x1;
        if (state[i] > 0.5 || state[i + 9] > 0.5) {
            // It is illegal to play on a square that already has an X or O.
            // This results in an immediate game over.
            const nextState = new state_1.State(this.getStateSize(), nextPlayer, nextPlayer);
            this.copyState(state.data, nextState.data);
            return nextState;
        }
        const nextStateData = new Float32Array(this.getStateSize());
        this.copyState(state.data, nextStateData);
        nextStateData[offset + i] = 1.0;
        if (this.checkForWin(offset, nextStateData)) {
            const nextState = new state_1.State(this.getStateSize(), state.playerIndex, state.playerIndex);
            this.copyState(nextStateData, nextState.data);
            return nextState;
        }
        else {
            const nextState = new state_1.State(this.getStateSize(), nextPlayer);
            this.copyState(nextStateData, nextState.data);
            return nextState;
        }
    }
}
exports.TicTacToe = TicTacToe;
//# sourceMappingURL=ticTacToe.js.map

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