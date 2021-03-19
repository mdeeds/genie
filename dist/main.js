/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 138:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const table_1 = __webpack_require__(700);
const table = new table_1.Table();
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 700:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Table = void 0;
class Table {
    constructor() {
        this.magnets = new Set();
        const body = document.getElementsByTagName('body')[0];
        this.container = document.createElement('div');
        this.container.classList.add('table');
        body.appendChild(this.container);
        for (let i = 0; i < 5; ++i) {
            this.addToken("X", 100 + i * 20, 100);
            this.addToken("O", 100 + i * 30, 150);
        }
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 3; ++j) {
                this.addMagnet(i * 50 + 300, j * 50 + 100);
            }
        }
    }
    addToken(label, x, y) {
        const token = document.createElement('span');
        token.innerText = label;
        token.classList.add('token');
        token.style.left = `${x}px`;
        token.style.top = `${y}px`;
        token.addEventListener('mousedown', (me) => {
            this.handleMouseEvent(token, me);
        });
        token.addEventListener('mousemove', (me) => {
            this.handleMouseEvent(token, me);
        });
        token.addEventListener('mouseout', (me) => {
            this.handleMouseEvent(token, me);
        });
        token.addEventListener('mouseup', (me) => {
            this.handleMouseEvent(token, me);
        });
        // this.container.addEventListener('mousemove',
        //   (me) => {
        //     if (this.dragging) {
        //       this.handleMouseEvent(this.dragging, me);
        //     }
        //   })
        this.container.appendChild(token);
    }
    addMagnet(x, y) {
        const magnet = document.createElement('span');
        magnet.classList.add('magnet');
        magnet.style.left = `${x}px`;
        magnet.style.top = `${y}px`;
        this.container.appendChild(magnet);
        this.magnets.add(magnet);
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
        const tokenBB = token.getBoundingClientRect();
        token.style.left = `${x - tokenBB.width / 2 - this.container.offsetLeft}px`;
        token.style.top = `${y - tokenBB.height / 2 - this.container.offsetTop}px`;
    }
    moveToCenter(token, location) {
        const x = (location.left + location.right) / 2;
        const y = (location.top + location.bottom) / 2;
        this.moveToXY(token, x, y);
    }
    checkMagnets(token) {
        const tokenBB = token.getBoundingClientRect();
        for (const m of this.magnets) {
            const magnetBB = m.getBoundingClientRect();
            if (this.intersects(magnetBB, tokenBB)) {
                this.moveToCenter(token, magnetBB);
                break;
            }
        }
    }
    handleMouseEvent(token, ev) {
        ev.preventDefault();
        switch (ev.type) {
            case 'mousemove':
            case 'mouseout':
                if (this.dragging != ev.target) {
                    return;
                }
                break;
            case 'mousedown':
                this.dragging = ev.target;
                this.dragging.classList.add('dragging');
                break;
            case 'mouseup':
                this.checkMagnets(token);
                this.dragging.classList.remove('dragging');
                this.dragging = null;
                return;
        }
        this.moveToXY(token, ev.clientX, ev.clientY);
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