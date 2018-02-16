import { Slide } from "./Slide";

export class SlideGroup {
	private _name: string;
	private _slides: Slide[];

	constructor(name: string, slides: Slide[]) {
		this._name = name;
		this._slides = slides.slice();
	}
}