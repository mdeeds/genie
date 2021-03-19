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

  // Ordered list of magnets.  The order in this list
  // corresponds to the order in the state vector.
  private magnets: Magnet[];

  // Maps token label to an index.  This is used to generate a State
  // object from the magnets.
  private tokenIndex: Map<string, number>;
  constructor() {
    this.magnets = [];
    this.tokenIndex = new Map<string, number>();

    const body = document.getElementsByTagName('body')[0];

    this.container = document.createElement('div');
    this.container.classList.add('table');
    body.appendChild(this.container);

    for (let i = 0; i < 5; ++i) {
      this.addToken("X", 50 + i * 30, 100);
    }
    for (let i = 0; i < 4; ++i) {
      this.addToken("O", 65 + i * 30, 150);
    }

    for (let i = 0; i < 3; ++i) {
      for (let j = 0; j < 3; ++j) {
        this.addMagnet(i * 50 + 300, j * 50 + 100);
      }
    }

    const display = document.createElement('div');
    display.classList.add('display');
    body.appendChild(display);
    display.innerText = "** D I S P L A Y **";
    this.updateLoop(display);
  }

  private updateLoop(display: HTMLDivElement) {
    display.innerText = `${this.getStateData()}`;

    setTimeout(() => { this.updateLoop(display); }, 100);
  }

  private addToken(label: string, x: number, y: number) {
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
  }

  addMagnet(x: number, y: number) {
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
    const tokenBB = token.getBoundingClientRect();
    token.style.left = `${x - tokenBB.width / 2}px`;
    token.style.top = `${y - tokenBB.height / 2}px`;
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
  }

  private dragging: HTMLSpanElement;
  private handleMouseEvent(token: Token, ev: MouseEvent) {
    ev.preventDefault();
    switch (ev.type) {
      case 'mousemove':
      case 'mouseout':
        if (this.dragging != ev.target) {
          return;
        }
        break;
      case 'mousedown':
        this.dragging = ev.target as HTMLSpanElement;
        this.dragging.classList.add('dragging');
        if (token.magnet !== null) {
          token.magnet.token = null;
          token.magnet = null;
        }
        break;
      case 'mouseup':
        this.checkMagnets(token);
        this.dragging.classList.remove('dragging');
        this.dragging = null;
        return;
    }
    this.moveToXY(token.element,
      ev.clientX,
      ev.clientY);
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

}