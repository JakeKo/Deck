import { EllipseRenderer } from "../graphics";
import EllipseOutlineRenderer from "../helpers/EllipseOutlineRenderer";
import SlideRenderer from "../SlideRenderer";
import { GraphicMarker } from "../types";

type EllipseMarkerArgs = {
    slide: SlideRenderer;
    target: EllipseRenderer;
    scale: number;
};

class EllipseMarker implements GraphicMarker {
    private _slide: SlideRenderer;
    private _target: EllipseRenderer;
    private _scale: number;
    private _helper: EllipseOutlineRenderer;

    constructor(args: EllipseMarkerArgs) {
        this._slide = args.slide;
        this._target = args.target;
        this._scale = args.scale;

        this._helper = new EllipseOutlineRenderer({
            slide: this._slide,
            scale: this._scale,
            center: this._target.getCenter(),
            width: this._target.getWidth(),
            height: this._target.getHeight()
        });

        this._helper.render();
    }

    public unmark(): void {
        this._helper.unrender();
    }

    public setScale(scale: number): void {
        this._helper.setScale(scale);
    }
}

export default EllipseMarker;
