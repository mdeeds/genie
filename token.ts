import { Magnet } from "./magnet";

export class Token {
  label: string;
  element: HTMLSpanElement;
  magnet: Magnet = null;
  constructor(label: string, element: HTMLSpanElement) {
    this.label = label;
    this.element = element;
  }
}
