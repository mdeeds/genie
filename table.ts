import { LegalLocationModel } from "./legalLocationModel";

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
  constructor() {
    this.tokenIndex = new Map<string, number>();

    const body = document.getElementsByTagName('body')[0];

    /***** Player indicator *****/
    const doneButton = document.createElement('span');
    doneButton.classList.add('button');
    doneButton.innerText = 'Next player';
    body.appendChild(doneButton);

    /***** Playing surface *****/
    this.container = document.createElement('div');
    this.container.classList.add('table');
    body.appendChild(this.container);

    const playerIndicator =
      this.addLabelIndicator(this.container, ['X to play', 'O to play'], 0, 0);
    doneButton.addEventListener('click', (ev) => {
      playerIndicator.increment();
      this.updateDisplay();
    })

    this.addBag("X", 50, 100);
    this.addBag("O", 50, 200);
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
    this.updateDisplay();

    this.initializeModels();
  }

  async initializeModels() {
    const sampleData = this.getStateData();
    this.legalSourceModel = await LegalLocationModel.make(
      sampleData.length, this.magnets.length + this.tokenIndex.size);

    this.legalDestinationModel = await LegalLocationModel.make(
      sampleData.length, this.magnets.length + this.tokenIndex.size);
  }

  getStateData(): Float32Array {
    const numTokens = this.tokenIndex.size;
    const numMagnets = this.magnets.length;
    const numIndicators = this.indicators.length;
    const result = new Float32Array(numTokens * numMagnets + numIndicators);

    for (let i = 0; i < this.magnets.length; ++i) {
      const m = this.magnets[i];
      if (m.token !== null) {
        const tokenIndex = this.tokenIndex.get(m.token.label);
        result[i + tokenIndex * numMagnets] = 1.0;
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

  // Highlights the move from `sourceIndex` to `destinationIndex`.
  private highlightMoveSD(sourceIndex: number, destinationIndex: number) {
    // TODO
  }

  private updateDisplay() {
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

  private getElementForLocation(location: number) {
    if (location < this.magnets.length) {
      return this.magnets[location];
    } else {
      // TODO return the bag.
      return this.magnets[0];
    }
  }

  private highlightLocations(locations: Float32Array,
    highlight: Function, dontHighlight: Function) {
    const sourcePositions = this.magnets.length + this.tokenIndex.size;
    for (let i = 0; i < locations.length; ++i) {
      const elt = this.magnets[i].element;
      if (locations[i] > 0.5) {
        highlight(elt);
      } else {
        dontHighlight(elt);
      }
    }
  }

  private highlightSources(sources: Float32Array) {
    let fromElements = this.container.getElementsByClassName('from')
    while (fromElements.length > 0) {
      fromElements[0].remove();
    }
    this.highlightLocations(sources,
      (elt: HTMLSpanElement) => {
        const star = document.createElement('span');
        star.innerHTML = "&#x2606;";
        star.classList.add('from');
        star.addEventListener("mouseup", (me) => {
          this.handleSpanMouseEvent(star, me);
        })
        this.container.appendChild(star);
        this.moveToCenter(star, elt.getBoundingClientRect());
      },
      (elt) => { })
  }

  // private highlightDestinations(destinations: Float32Array) {
  //   let fromElements = this.container.getElementsByClassName('to')
  //   while (fromElements.length > 0) {
  //     fromElements[0].remove();
  //   }
  //   this.highlightLocations(destinations,
  //     (elt: HTMLSpanElement) => {
  //       const star = document.createElement('span');
  //       star.innerHTML = "&#x25cb;";
  //       star.classList.add('to');
  //       star.addEventListener('mouseup', (me) => {
  //         this.handleMouseEvent(star., me);
  //       this.container.appendChild(star);
  //       this.moveToCenter(star, elt.getBoundingClientRect());
  //     },
  //     (elt) => { })
  // }

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
  private handleSpanMouseEvent(span: HTMLSpanElement, ev: MouseEvent) {
    ev.preventDefault();
    switch (ev.type) {
      case 'mouseup':
        span.remove();
        return;
    }
  }
}