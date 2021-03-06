import { DocumentUtil } from "./documentUtil";
import { Token } from "./token";

export class Magnet {
  element: HTMLSpanElement;
  private highlightElts: HTMLSpanElement[] = [];
  private highlightValues: number[] = [];
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
      const i = tokenIndex.get(t.getLabel());
      result[i] = result[i] + 1;
    }
    return result;
  }

  removeAllTokens() {
    for (const token of this.tokens) {
      token.magnet = null;
    }
    this.tokens.splice(0);
  }

  getHighlightValues() {
    return this.highlightValues;
  }

  label(): string {
    if (this.tokens.length === 0) {
      throw "Empty magnet";
    }
    return this.tokens[0].getLabel();
  }

  accepts(token: Token) {
    if (this.tokens.length === 0) {
      return true;
    }
    if (this.tokens[0].getLabel() === token.getLabel()) {
      return true;
    }
    return false;
  }

  add(token: Token) {
    if (!this.accepts(token)) {
      throw "Wrong token.";
    }
    if (this.tokens.indexOf(token) >= 0) {
      // We already have this token.
      return;
    }
    this.tokens.push(token);
    let message: string = "";
    for (const t of this.tokens) {
      message += t.getLabel();
    }
    token.magnet = this;
    DocumentUtil.moveToCenter(token.getElement(),
      this.element.getBoundingClientRect());
  }

  pop(): Token {
    return this.tokens.pop();
  }

  hasHighlight() {
    return this.highlightElts.length > 0;
  }

  highlight(html: string, value: number) {
    const highlightElt = document.createElement('span');
    highlightElt.classList.add('highlight');
    highlightElt.innerHTML = html;
    this.element.parentElement.appendChild(highlightElt);
    DocumentUtil.moveToCenter(
      highlightElt, this.element.getBoundingClientRect());
    this.highlightElts.push(highlightElt);
    this.highlightValues.push(value);
  }
  highlightCircle() {
    this.highlight("&#x25cb;", 1);
  }

  highlightStar() {
    this.highlight("&#x2b5c;", 0);  // ("&#x2B26;");
  }

  removeAllHighlights() {
    for (const h of this.highlightElts) {
      h.parentElement.removeChild(h);
    }
    this.highlightElts.splice(0);
    this.highlightValues.splice(0);
  }
}

