import { Magnet } from "./magnet";

export class Token {
  private label: string;
  private element: HTMLSpanElement;
  magnet: Magnet = null;
  constructor(label: string, element: HTMLSpanElement) {
    this.label = label;
    this.element = element;
  }
  getLabel() {
    return this.label;
  }
  getElement() {
    return this.element;
  }
}
