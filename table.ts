import { Move } from "./move";
import { State } from "./state";

class Token {
  label: string;
  element: HTMLSpanElement;
  magnet: Magnet = null;
  constructor(label: string, element: HTMLSpanElement) {
    this.label = label;
    this.element = element;
  }
}

class Magnet {
  element: HTMLSpanElement;
  token: Token = null;
  constructor(element: HTMLSpanElement) {
    this.element = element;
  }
}

export class Table {
  private container: HTMLDivElement;
  private display: HTMLDivElement;

  // Ordered list of magnets.  The order in this list
  // corresponds to the order in the state vector.
  private magnets: Magnet[] = [];

  // Ordered list of players.
  private players: string[] = [];
  // Index of current player.  This corresponds to playerIndex in
  // the State class.
  private playerIndex: number = 0;

  private playerSpan: HTMLSpanElement;

  // Maps token label to an index.  This is used to generate a State
  // object from the magnets.
  private tokenIndex: Map<string, number>;
  constructor() {
    this.tokenIndex = new Map<string, number>();

    const body = document.getElementsByTagName('body')[0];

    /***** Player indicator *****/
    this.addPlayer("X");
    this.addPlayer("O");

    const playerContainer = document.createElement('span');
    playerContainer.classList.add('player');
    playerContainer.innerText = 'Your turn: ';
    body.appendChild(playerContainer);

    this.playerSpan = document.createElement('span');
    this.playerSpan.innerText = this.players[this.playerIndex];
    playerContainer.appendChild(this.playerSpan);

    const doneButton = document.createElement('span');
    doneButton.classList.add('button');
    doneButton.innerText = 'Done';
    playerContainer.appendChild(doneButton);

    /***** Playing surface *****/
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

    /***** Debug display *****/
    this.display = document.createElement('div');
    this.display.classList.add('display');
    body.appendChild(this.display);
    this.display.innerText = "** D I S P L A Y **";
    this.updateDisplay();
  }

  getStateSize(): number {
    return this.magnets.length;
  }

  // Sets the current board position to match `state`.
  setState(state: State) {
    // TODO
  }

  getStateData(): Float32Array {
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

  getMoveSize(): number {
    const sourcePositions = this.magnets.length + this.tokenIndex.size;
    const destinationPositions = this.magnets.length;

    return sourcePositions * destinationPositions;
  }

  // Highlights the move from `sourceIndex` to `destinationIndex`.
  private highlightMoveSD(sourceIndex: number, destinationIndex: number) {
    // TODO
  }

  // Highlights the most prominant move specified in the input
  // vector.
  // If `s` is the source index, and `d` is the destination index,
  // and `m` is the number of possible destinations, then 
  // the cell at s * m + d corresponds to the source-destination pair
  // s->d
  highlightMove(move: Move) {
    // TODO (do some magic, then call highlightMoveSD)
  }

  private updateDisplay() {
    this.display.innerText = `${this.getStateData()}`;
  }

  private addBag(label: string, x: number, y: number) {
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

  private addPlayer(name: string) {
    this.players.push(name);
  }

  private makeToken(label: string, x: number, y: number): Token {
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

  private addMagnet(x: number, y: number) {
    const magnet = document.createElement('span');
    magnet.classList.add('magnet');
    magnet.style.left = `${x}px`;
    magnet.style.top = `${y}px`;
    this.container.appendChild(magnet);
    const m = new Magnet(magnet);
    this.magnets.push(m);
  }

  private intersects(a: DOMRect, b: DOMRect) {
    if (a.left <= b.right && a.top <= b.bottom &&
      a.right >= b.left && a.bottom >= b.top) {
      return true;
    } else {
      return false;
    }
  }

  private moveToXY(token: HTMLSpanElement, x: number, y: number) {
    const bb = this.container.getBoundingClientRect();
    const tokenBB = token.getBoundingClientRect();
    token.style.left = `${x - tokenBB.width / 2 - bb.left}px`;
    token.style.top = `${y - tokenBB.height / 2 - bb.top}px`;
  }

  private moveToCenter(token: HTMLSpanElement, location: DOMRect) {
    const x = (location.left + location.right) / 2;
    const y = (location.top + location.bottom) / 2;
    this.moveToXY(token, x, y);
  }

  private checkMagnets(token: Token) {
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

  private dragging: Token;
  private handleMouseEvent(token: Token, ev: MouseEvent) {
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
}