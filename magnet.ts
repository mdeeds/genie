import { DocumentUtil } from "./documentUtil";
import { Token } from "./token";

export class Magnet {
  element: HTMLSpanElement;
  private highlightElt: HTMLSpanElement = null;
  private tokens: Token[] = [];
  constructor(element: HTMLSpanElement) {
    this.element = element;
  }

  hasTokens(): boolean {
    return this.tokens.length > 0;
  }

  tokenValues(tokenIndex: Map<string, number>): Float32Array {
    const result = new Float32Array(tokenIndex.size);
    for (const t of this.tokens) {
      const i = tokenIndex.get(t.label);
      result[i] = result[i] + 1;
    }
    return result;
  }

  label(): string {
    if (this.tokens.length === 0) {
      throw "Empt magnet";
    }
    return this.tokens[0].label;
  }

  accepts(token: Token) {
    if (this.tokens.length === 0) {
      return true;
    }
    if (this.tokens[0].label = token.label) {
      return true;
    }
    return false;
  }

  add(token: Token) {
    if (!this.accepts(token)) {
      throw "Wrong token.";
    }
    this.tokens.push(token);
    token.magnet = this;
  }

  pop(): Token {
    return this.tokens.pop();
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

class Bag extends Magnet {

}

