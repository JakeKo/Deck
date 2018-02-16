import { Style } from "./style";
import { Element } from "./element";

class Slide {
	private _style: Style;
	private _elements: Element[];

	constructor(style: Style, elements: Element[]) {
		this._style = style;
		this._elements = elements.slice();
	}
};