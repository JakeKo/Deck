import { CurveRenderer } from "../graphics";
import CurveOutlineRenderer from "../helpers/CurveOutlineRenderer";
import SlideRenderer from "../SlideRenderer";
import { GraphicMarker } from "../types";

type CurveMarkerArgs = {
    slide: SlideRenderer;
    target: CurveRenderer;
    scale: number;
};

class CurveMarker implements GraphicMarker {
    private _slide: SlideRenderer;
    private _target: CurveRenderer;
    private _scale: number;
    private _helper: CurveOutlineRenderer;

    constructor(args: CurveMarkerArgs) {
        this._slide = args.slide;
        this._target = args.target;
        this._scale = args.scale;

        this._helper = new CurveOutlineRenderer({
            slide: this._slide,
            scale: this._scale,
            anchors: this._target.getAnchors()
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

export default CurveMarker;
