export class DocumentUtil {
  static moveToXY(token: HTMLSpanElement, x: number, y: number) {
    const bb = token.parentElement.getBoundingClientRect();
    const tokenBB = token.getBoundingClientRect();
    token.style.left = `${x - tokenBB.width / 2 - bb.left}px`;
    token.style.top = `${y - tokenBB.height / 2 - bb.top}px`;
  }

  static moveToCenter(token: HTMLSpanElement, location: DOMRect) {
    const x = (location.left + location.right) / 2;
    const y = (location.top + location.bottom) / 2;
    DocumentUtil.moveToXY(token, x, y);
  }

  static getBody() {
    return document.getElementsByTagName('body')[0];
  }
}