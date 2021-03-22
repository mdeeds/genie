import { DocumentUtil } from "./documentUtil";
import { Token } from "./token";

export class Magnet {
  element: HTMLSpanElement;
  private highlightElt: HTMLSpanElement = null;
  token: Token = null;
  constructor(element: HTMLSpanElement) {
    this.element = element;
  }
  hasHighlight() {
    return !!this.highlightElt;
  }

  highlight(html: string) {
    this.removeHighlight();
    this.highlightElt = document.createElement('span');
    this.highlightElt.classList.add('highlight');
    this.highlightElt.innerHTML = html;
    this.element.parentElement.appendChild(this.highlightElt);
    DocumentUtil.moveToCenter(
      this.highlightElt, this.element.getBoundingClientRect());
  }
  highlightCircle() {
    this.highlight("&#x25cb;");
  }
  removeHighlight() {
    if (this.highlightElt) {
      this.highlightElt.parentElement.removeChild(this.highlightElt);
      this.highlightElt = null;
    }
  }
}
