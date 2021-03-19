export class Table {
  private container: HTMLDivElement;
  private magnets: Set<HTMLSpanElement>;
  constructor() {
    this.magnets = new Set<HTMLSpanElement>();

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

  addToken(label: string, x: number, y: number) {
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

  addMagnet(x: number, y: number) {
    const magnet = document.createElement('span');
    magnet.classList.add('magnet');
    magnet.style.left = `${x}px`;
    magnet.style.top = `${y}px`;
    this.container.appendChild(magnet);
    this.magnets.add(magnet);
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
    token.style.left = `${x - tokenBB.width / 2 - this.container.offsetLeft}px`;
    token.style.top = `${y - tokenBB.height / 2 - this.container.offsetTop}px`;
  }

  private moveToCenter(token: HTMLSpanElement, location: DOMRect) {
    const x = (location.left + location.right) / 2;
    const y = (location.top + location.bottom) / 2;
    this.moveToXY(token, x, y);
  }

  private checkMagnets(token: HTMLSpanElement) {
    const tokenBB = token.getBoundingClientRect();
    for (const m of this.magnets) {
      const magnetBB = m.getBoundingClientRect();
      if (this.intersects(magnetBB, tokenBB)) {
        this.moveToCenter(token, magnetBB);
        break;
      }
    }
  }

  private dragging: HTMLSpanElement;
  handleMouseEvent(token: HTMLSpanElement, ev: MouseEvent) {
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

        break;
      case 'mouseup':
        this.checkMagnets(token);
        this.dragging = null;
        break;
    }
    if (ev.movementX === null || ev.movementY === null) {
      return;
    }
    token.style.left = `${token.offsetLeft + ev.movementX}px`;
    token.style.top = `${token.offsetTop + ev.movementY}px`;
  }

}