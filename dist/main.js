/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 138:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const moveSorter_1 = __webpack_require__(832);
const table_1 = __webpack_require__(700);
const table = new table_1.Table();
const sorter = new moveSorter_1.MoveSorter();
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 832:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MoveSorter = void 0;
class SortArea {
    constructor(label, type, container) {
        this.element = document.createElement('div');
        const labelDiv = document.createElement('div');
        labelDiv.innerText = label;
        this.element.appendChild(labelDiv);
        this.element.classList.add('sortCell');
        this.element.classList.add(type);
        this.element.addEventListener('dragover', (ev) => {
            ev.preventDefault();
        });
        this.element.addEventListener('drop', (ev) => {
            ev.preventDefault();
            this.add(MoveIcon.moveInMotion);
        });
        container.appendChild(this.element);
    }
    add(m) {
        for (const child of this.element.childNodes) {
            if (child['moveIcon']) {
                const childM = child['moveIcon'];
                if (m.getSortScore() < childM.getSortScore()) {
                    this.element.insertBefore(m.element, childM.element);
                    return;
                }
            }
        }
        this.element.appendChild(m.element);
    }
}
class MoveIcon {
    constructor(score) {
        this.score = score;
        this.element = document.createElement('div');
        this.element.classList.add('move');
        this.element.draggable = true;
        this.element.style.filter = `hue-rotate(${score * 0.9 - 0.5}turn)`;
        this.element.addEventListener('dragstart', (ev) => {
            this.element.style.opacity = '0.5';
            MoveIcon.moveInMotion = this;
        });
        this.element.addEventListener('dragend', (ev) => {
            this.element.style.opacity = '';
        });
        this.element.addEventListener('mousedown', (ev) => {
            for (const selected of document.getElementsByClassName('selected')) {
                selected.classList.remove('selected');
            }
            this.element.classList.add('selected');
        });
        this.element['moveIcon'] = this;
    }
    getSortScore() {
        return Math.abs(this.score - 0.5);
    }
}
MoveIcon.moveInMotion = null;
class MoveSorter {
    // private goodMoves: SortArea;
    // private badMoves: SortArea;
    constructor() {
        const body = document.getElementsByTagName('body')[0];
        const container = document.createElement('div');
        container.classList.add('sortArea');
        body.appendChild(container);
        this.unsortedMoves = new SortArea('unsorted', 'unsorted', container);
        this.legalMoves = new SortArea('legal', 'legal', container);
        this.illegalMoves = new SortArea('illegal', 'illegal', container);
        // this.goodMoves = new SortArea('good', 'good', this.legalMoves.element);
        // this.badMoves = new SortArea('bad', 'bad', this.legalMoves.element);
        for (let i = 0; i < 10; ++i) {
            const m = new MoveIcon(Math.random());
            this.unsortedMoves.add(m);
        }
        this.legalMoves.add(new MoveIcon(Math.random()));
        this.illegalMoves.add(new MoveIcon(Math.random()));
        // const m3 = new MoveIcon(this.goodMoves.element, Math.random());
        // const m4 = new MoveIcon(this.badMoves.element, Math.random());
    }
}
exports.MoveSorter = MoveSorter;
//# sourceMappingURL=moveSorter.js.map

/***/ }),

/***/ 700:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Table = void 0;
class Token {
    constructor(label, element) {
        this.magnet = null;
        this.label = label;
        this.element = element;
    }
}
class Magnet {
    constructor(element) {
        this.token = null;
        this.element = element;
    }
}
class Table {
    constructor() {
        this.magnets = [];
        this.tokenIndex = new Map();
        const body = document.getElementsByTagName('body')[0];
        this.container = document.createElement('div');
        this.container.classList.add('table');
        body.appendChild(this.container);
        this.addBag("X", 50, 100);
        this.addBag("O", 50, 200);
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 3; ++j) {
                this.addMagnet(i * 50 + 200, j * 50 + 100);
            }
        }
        this.display = document.createElement('div');
        this.display.classList.add('display');
        body.appendChild(this.display);
        this.display.innerText = "** D I S P L A Y **";
        this.updateDisplay();
    }
    updateDisplay() {
        this.display.innerText = `${this.getStateData()}`;
    }
    addBag(label, x, y) {
        if (!this.tokenIndex.has(label)) {
            this.tokenIndex.set(label, this.tokenIndex.size);
        }
        const elt = document.createElement('span');
        elt.classList.add('bag');
        elt.style.left = `${x}px`;
        elt.style.top = `${y}px`;
        elt.innerText = label;
        this.container.appendChild(elt);
        elt.addEventListener('mousedown', (me) => {
            const t = this.makeToken(label, x, y);
            this.handleMouseEvent(t, me);
        });
    }
    makeToken(label, x, y) {
        if (!this.tokenIndex.has(label)) {
            this.tokenIndex.set(label, this.tokenIndex.size);
        }
        const token = document.createElement('span');
        token.innerText = label;
        token.classList.add('token');
        token.style.left = `${x}px`;
        token.style.top = `${y}px`;
        const t = new Token(label, token);
        token.addEventListener('mousedown', (me) => {
            this.handleMouseEvent(t, me);
        });
        token.addEventListener('mousemove', (me) => {
            this.handleMouseEvent(t, me);
        });
        token.addEventListener('mouseout', (me) => {
            this.handleMouseEvent(t, me);
        });
        token.addEventListener('mouseup', (me) => {
            this.handleMouseEvent(t, me);
        });
        this.container.appendChild(token);
        return t;
    }
    addMagnet(x, y) {
        const magnet = document.createElement('span');
        magnet.classList.add('magnet');
        magnet.style.left = `${x}px`;
        magnet.style.top = `${y}px`;
        this.container.appendChild(magnet);
        const m = new Magnet(magnet);
        this.magnets.push(m);
    }
    intersects(a, b) {
        if (a.left <= b.right && a.top <= b.bottom &&
            a.right >= b.left && a.bottom >= b.top) {
            return true;
        }
        else {
            return false;
        }
    }
    moveToXY(token, x, y) {
        const bb = this.container.getBoundingClientRect();
        const tokenBB = token.getBoundingClientRect();
        token.style.left = `${x - tokenBB.width / 2 - bb.left}px`;
        token.style.top = `${y - tokenBB.height / 2 - bb.top}px`;
    }
    moveToCenter(token, location) {
        const x = (location.left + location.right) / 2;
        const y = (location.top + location.bottom) / 2;
        this.moveToXY(token, x, y);
    }
    checkMagnets(token) {
        const tokenBB = token.element.getBoundingClientRect();
        for (const m of this.magnets) {
            const magnetBB = m.element.getBoundingClientRect();
            if (this.intersects(magnetBB, tokenBB)) {
                this.moveToCenter(token.element, magnetBB);
                m.token = token;
                token.magnet = m;
                break;
            }
        }
        this.updateDisplay();
    }
    handleMouseEvent(token, ev) {
        ev.preventDefault();
        switch (ev.type) {
            case 'mousemove':
            case 'mouseout':
                if (this.dragging != token) {
                    return;
                }
                break;
            case 'mousedown':
                this.dragging = token;
                this.dragging.element.classList.add('dragging');
                if (token.magnet !== null) {
                    token.magnet.token = null;
                    token.magnet = null;
                }
                break;
            case 'mouseup':
                this.checkMagnets(token);
                this.dragging.element.classList.remove('dragging');
                this.dragging = null;
                return;
        }
        this.moveToXY(token.element, ev.clientX, ev.clientY);
    }
    getStateData() {
        const numTokens = this.tokenIndex.size;
        const numMagnets = this.magnets.length;
        const result = new Float32Array(numTokens * numMagnets);
        for (let i = 0; i < this.magnets.length; ++i) {
            const m = this.magnets[i];
            if (m.token !== null) {
                const tokenIndex = this.tokenIndex.get(m.token.label);
                result[i + tokenIndex * numMagnets] = 1.0;
            }
        }
        return result;
    }
}
exports.Table = Table;
//# sourceMappingURL=table.js.map

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