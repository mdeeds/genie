import { DocumentUtil } from "./documentUtil";
import { LegalLocationModel } from "./legalLocationModel";
import { Magnet } from "./magnet";
import { Token } from "./token";

class LabelIndicator {
  labels: string[];
  element: HTMLSpanElement;
  index: number;
  constructor(container: HTMLDivElement,
    labels: string[], x: number, y: number) {
    this.element = document.createElement('span');
    this.element.classList.add('labelIndicator');
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    container.appendChild(this.element);

    this.labels = labels;
    this.setIndex(0);
  }

  setIndex(index: number) {
    this.index = index;
    this.element.innerText = this.labels[index];
  }

  increment() {
    this.setIndex((this.index + 1) % this.labels.length)
  }

  value() {
    return this.index;
  }
}

class SelectBox {
  private x0: number;
  private y0: number;
  private left: number;
  private top: number;
  private width: number;
  private height: number;
  private elt: HTMLSpanElement;
  active: boolean;
  constructor(startX: number, startY: number,
    container: HTMLDivElement) {
    const bb = container.getBoundingClientRect();
    this.x0 = startX - bb.left;
    this.y0 = startY - bb.top;
    this.left = this.x0;
    this.top = this.y0;
    this.width = 0;
    this.height = 0;
    this.elt = document.createElement('span');
    this.elt.classList.add('selection');
    container.appendChild(this.elt);
    this.active = true;
  }

  extendTo(x: number, y: number) {
    const bb = this.elt.parentElement.getBoundingClientRect();
    const x1 = x - bb.left;
    const y1 = y - bb.top;
    this.width = Math.abs(this.x0 - x1);
    this.height = Math.abs(this.y0 - y1);
    this.left = Math.min(this.x0, x1);
    this.top = Math.min(this.y0, y1);
    this.elt.style.setProperty('left', `${this.left}px`);
    this.elt.style.setProperty('top', `${this.top}px`);
    this.elt.style.setProperty('width', `${this.width}px`);
    this.elt.style.setProperty('height', `${this.height}px`);
  }

  remove() {
    this.elt.parentElement.removeChild(this.elt);
  }
}

export class Table {
  private legalSourceModel: LegalLocationModel;
  private legalDestinationModel: LegalLocationModel;

  private container: HTMLDivElement;
  private display: HTMLDivElement;

  // Ordered list of magnets.  The order in this list
  // corresponds to the order in the state vector.
  private magnets: Magnet[] = [];

  // Indicators store and display information like who's turn it is and if the game is ended.
  private indicators: LabelIndicator[] = [];

  // Maps token label to an index.  This is used to generate a State
  // object from the magnets.
  private tokenIndex: Map<string, number>;

  private selectBox: SelectBox;
  constructor() {
    this.tokenIndex = new Map<string, number>();

    const body = DocumentUtil.getBody();

    /***** Player indicator *****/
    const doneButton = document.createElement('span');
    doneButton.classList.add('button');
    doneButton.innerText = 'Next player';
    body.appendChild(doneButton);

    /***** Playing surface *****/
    this.container = document.createElement('div');
    this.container.classList.add('table');
    body.appendChild(this.container);

    this.container.addEventListener('mousedown', (ev) => {
      if (this.selectBox) {
        this.selectBox.remove();
      }
      this.selectBox = new SelectBox(ev.x, ev.y, this.container);
    });
    this.container.addEventListener('mousemove', (ev) => {
      if (this.selectBox && this.selectBox.active) {
        this.selectBox.extendTo(ev.clientX, ev.clientY);
      }
    });
    this.container.addEventListener('mouseup', (ev) => {
      if (this.selectBox) {
        this.selectBox.active = false;
      }
    });


    const playerIndicator =
      this.addLabelIndicator(this.container, ['X to play', 'O to play'], 0, 0);
    doneButton.addEventListener('click', (ev) => {
      playerIndicator.increment();
      this.updateDisplay();
    })

    this.addBag("X", 5, 50, 100);
    this.addBag("O", 4, 50, 200);
    for (let i = 0; i < 3; ++i) {
      for (let j = 0; j < 3; ++j) {
        this.addMagnet(i * 50 + 200, j * 50 + 100);
      }
    }
    this.addLabelIndicator(this.container,
      ["Game in progress", "X won", "O won", "Cats Game"], 300, 0);

    /***** Debug display *****/
    this.display = document.createElement('div');
    this.display.classList.add('display');
    body.appendChild(this.display);
    this.display.innerText = "** D I S P L A Y **";
    this.initializeModels();
  }

  async initializeModels() {
    const sampleData = this.getStateData();
    this.legalSourceModel = await LegalLocationModel.make(
      [[sampleData.length, 1]], this.magnets.length + this.tokenIndex.size);

    this.legalDestinationModel = await LegalLocationModel.make(
      [[sampleData.length, 1]], this.magnets.length + this.tokenIndex.size);
    this.updateDisplay();
  }

  getStateData(): Float32Array {
    console.log(`AAAAA tokens: ${this.tokenIndex.size}`);
    console.log(`AAAAA magnets: ${this.magnets.length}`);
    const numTokens = this.tokenIndex.size;
    const numMagnets = this.magnets.length;
    const numIndicators = this.indicators.length;
    const result = new Float32Array(numTokens * numMagnets + numIndicators);

    for (let i = 0; i < this.magnets.length; ++i) {
      const m = this.magnets[i];
      if (m.hasTokens()) {
        const values = m.tokenValues(this.tokenIndex);
        for (let tokenIndex = 0; tokenIndex < values.length; ++tokenIndex) {
          result[i + tokenIndex * numMagnets] = values[tokenIndex];
        }
      }
    }
    for (let i = 0; i < numIndicators; ++i) {
      const indicator = this.indicators[i];
      result[i + numTokens * numMagnets] = indicator.value();
    }
    return result;
  }

  getMoveSize(): number {
    const sourcePositions = this.magnets.length + this.tokenIndex.size;
    const destinationPositions = this.magnets.length;

    return sourcePositions * destinationPositions;
  }

  private updateDisplay() {
    if (!this.display) {
      return;
    }
    const state = this.getStateData();
    this.display.innerText = `${state}`;
    if (this.legalSourceModel) {
      this.legalSourceModel.getLegalLocations(state).then((sources) => {
        this.highlightSources(sources);
        this.display.innerText += "\n"
        sources.forEach(element => {
          this.display.innerText += element.toFixed(2) + ",";
        });

      })
    }
    // if (this.legalDestinationModel) {
    //   this.legalDestinationModel.getLegalLocations(state).then(
    //     (destinations) => {
    //       this.highlightDestinations(destinations);
    //       this.display.innerText += "\n"
    //       destinations.forEach(element => {
    //         this.display.innerText += element.toFixed(2) + ",";
    //       });

    //     })
    // }
  }

  private highlightLocations(locations: Float32Array,
    html: string) {
    for (let i = 0; i < locations.length; ++i) {
      if (i >= this.magnets.length) {
        // TODO: Remove this when all locations are magnets.
        break;
      }
      const magnet = this.magnets[i];
      if (locations[i] > 0.5) {
        magnet.highlight(html);
      } else {
        magnet.removeHighlight();
      }
    }
  }

  private highlightSources(sources: Float32Array) {
    this.highlightLocations(sources, "&#x2606;")
  }

  private addBag(label: string, count: number, x: number, y: number) {
    if (!this.tokenIndex.has(label)) {
      this.tokenIndex.set(label, this.tokenIndex.size);
    }
    this.addMagnet(x, y);
    for (let i = 0; i < count; ++i) {
      const token = this.makeToken(label, x, y);
      this.checkMagnets(token);
    }
  }

  private addLabelIndicator(container, labels: string[], x: number, y: number) {
    const i = new LabelIndicator(container, labels, x, y);
    this.indicators.push(i);
    return i;
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
    magnet.addEventListener('click', (me) => {
      this.handleMagnetMouseEvent(m, me);
    });
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

  private checkMagnets(token: Token) {
    const tokenBB = token.element.getBoundingClientRect();
    for (const m of this.magnets) {
      if (!m.accepts(token)) {
        continue;
      }
      const magnetBB = m.element.getBoundingClientRect();
      if (this.intersects(magnetBB, tokenBB)) {
        DocumentUtil.moveToCenter(token.element, magnetBB);
        m.add(token);
        break;
      }
    }
    this.updateDisplay();
  }

  private dragging: Token;
  private handleMouseEvent(token: Token, ev: MouseEvent) {
    ev.stopPropagation();
    switch (ev.type) {
      case 'mousemove':
      case 'mouseout':
        if (this.dragging != token) {
          return;
        }
        break;
      case 'mousedown':
        if (token.magnet && token.magnet.hasTokens()) {
          this.dragging = token.magnet.pop();
        } else {
          this.dragging = token;
        }
        this.dragging.element.classList.add('dragging');
        break;
      case 'mouseup':
        this.checkMagnets(token);
        if (this.dragging) {
          this.dragging.element.classList.remove('dragging');
          this.dragging = null;
        }
        break;
    }
    DocumentUtil.moveToXY(token.element, ev.clientX, ev.clientY);
  }
  private handleMagnetMouseEvent(magnet: Magnet, ev: MouseEvent) {
    ev.preventDefault();
    switch (ev.type) {
      case 'click':
        if (magnet.hasHighlight()) {
          magnet.removeHighlight();
        } else {
          magnet.highlightCircle();
        }
        return;
    }
  }
}