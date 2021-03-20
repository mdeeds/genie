class SortArea {
  private element: HTMLDivElement;
  constructor(label: string, type: string, container: HTMLDivElement) {
    this.element = document.createElement('div');
    const labelDiv = document.createElement('div');
    labelDiv.innerText = label;
    this.element.appendChild(labelDiv);
    this.element.classList.add('sortCell')
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
  add(m: MoveIcon) {
    for (const child of this.element.childNodes) {
      if (child['moveIcon']) {
        const childM = child['moveIcon'] as MoveIcon;
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
  static moveInMotion: MoveIcon = null;
  element: HTMLDivElement;
  score: number;
  constructor(score: number) {
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

export class MoveSorter {
  private unsortedMoves: SortArea;
  private legalMoves: SortArea;
  private illegalMoves: SortArea;
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