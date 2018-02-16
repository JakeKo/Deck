import { Style } from "./Style";
import { Element } from "./Element";

export class Slide {
	private _style: Style;
	private _elements: Element[];

	constructor(style: Style, elements: Element[]) {
		this._style = style;
		this._elements = elements.slice();
	}
};