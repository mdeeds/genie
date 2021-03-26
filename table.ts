import { Log } from "./log";
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

  getBB() {
    return this.elt.getBoundingClientRect();
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
    this.container.tabIndex = 0;
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

    this.container.addEventListener('keypress', (ev) => {
      this.handleKeyPress(ev);
    })


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
      [[sampleData.length, 1]], this.magnets.length);

    this.legalDestinationModel = await LegalLocationModel.make(
      [[sampleData.length, 1]], this.magnets.length);
    this.updateDisplay();
  }

  getStateData(): Float32Array {
    const numTokens = this.tokenIndex.size;
    const numMagnets = this.magnets.length;
    const numIndicators = this.indicators.length;
    const result = new Float32Array(numTokens * numMagnets + numIndicators);

    for (let i = 0; i < this.magnets.length; ++i) {
      const m = this.magnets[i];
      if (m.hasTokens()) {
        const values = m.tokenValues(this.tokenIndex);
        for (let tokenIndex = 0; tokenIndex < values.length; ++tokenIndex) {
          result[i * numTokens + tokenIndex] = values[tokenIndex];
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

  private async updateDisplay() {
    if (!this.display) {
      return;
    }
    const state = this.getStateData();
    this.display.innerText = `${state}`;
    if (this.legalSourceModel) {
      const sources = await this.legalSourceModel.getLegalLocations(state)
      const destinations = await this.legalDestinationModel.getLegalLocations(state);

      this.highlightSourcesAndDestinations(
        sources, destinations);
      this.display.innerText += "\n"
      for (const element of sources) {
        this.display.innerText += element.toFixed(2) + ",";
      }
      this.display.innerText += "\n"
      for (const element of destinations) {
        this.display.innerText += element.toFixed(2) + ",";
      }
    }
  }


  private applyHighValueMagnets(locations: Float32Array,
    f: Function) {
    console.assert(locations.length === this.magnets.length);
    for (let i = 0; i < locations.length; ++i) {
      const magnet = this.magnets[i];
      if (locations[i] > 0.5) {
        f(magnet);
      }
    }
  }

  private highlightSourcesAndDestinations(
    sources: Float32Array, destinations: Float32Array) {
    for (const m of this.magnets) {
      m.removeAllHighlights();
    }
    this.applyHighValueMagnets(sources,
      (m: Magnet) => { m.highlightStar(); });
    this.applyHighValueMagnets(destinations,
      (m: Magnet) => { m.highlightCircle(); });
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

  private checkMagnets(token: Token) {
    const tokenBB = token.getElement().getBoundingClientRect();
    for (const m of this.magnets) {
      if (!m.accepts(token)) {
        continue;
      }
      const magnetBB = m.element.getBoundingClientRect();
      if (DocumentUtil.intersects(magnetBB, tokenBB)) {
        DocumentUtil.moveToCenter(token.getElement(), magnetBB);
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
        this.dragging.getElement().classList.add('dragging');
        break;
      case 'mouseup':
        this.checkMagnets(token);
        if (this.dragging) {
          this.dragging.getElement().classList.remove('dragging');
          this.dragging = null;
        }
        return;
    }
    DocumentUtil.moveToXY(token.getElement(), ev.clientX, ev.clientY);
  }
  private handleMagnetMouseEvent(magnet: Magnet, ev: MouseEvent) {
    ev.preventDefault();
    switch (ev.type) {
      case 'click':
        if (magnet.hasHighlight()) {
          magnet.removeAllHighlights();
        } else {
          magnet.highlightCircle();
        }
        return;
    }
  }

  // Applies f to all selected magnets.
  private forAllSelectedMagnets(f: Function) {
    const selectionBB = this.selectBox.getBB();
    if (!selectionBB) {
      return;
    }
    for (const m of this.magnets) {
      const bb = m.element.getBoundingClientRect();
      if (DocumentUtil.intersects(bb, selectionBB)) {
        f(m);
      }
    }
  }



  private handleKeyPress(ev: KeyboardEvent) {
    Log.info(`AAAAA: ${ev.key}`);
    switch (ev.key) {
      case 'Backspace':
      case 'Delete':
        this.forAllSelectedMagnets((m: Magnet) => { m.removeAllHighlights(); });
        break;
      case 's':
        this.forAllSelectedMagnets((m: Magnet) => { m.removeAllHighlights(); });
        this.forAllSelectedMagnets((m: Magnet) => { m.highlightStar(); });
        break;
      case 'd':
        this.forAllSelectedMagnets((m: Magnet) => { m.removeAllHighlights(); });
        this.forAllSelectedMagnets((m: Magnet) => { m.highlightCircle(); });
        break;
    }

  }
}