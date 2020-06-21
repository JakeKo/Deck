import SlideRenderer from "../SlideRenderer";
import Vector from "../../utilities/Vector";
import { CurveAnchor } from "../types";
import { CurveRenderer } from "../graphics";
import { CurveAnchorRenderer } from "../helpers";

type CurveMutatorArgs = {
    curve: CurveRenderer;
    slide: SlideRenderer;
};

class CurveMutator {
    private _curve: CurveRenderer;
    private _slide: SlideRenderer;
    private _helpers: CurveAnchorRenderer[];

    constructor(args: CurveMutatorArgs) {
        this._curve = args.curve;
        this._slide = args.slide;
        this._helpers = this._curve.getAnchors().map(anchor => new CurveAnchorRenderer({ canvas: this._slide.canvas, ...anchor }));
    }

    public move(origin: Vector): void {
        // Update rendering
        this._curve.move(origin);

        // Update helper graphics
        const anchors = this._curve.getAnchors();
        this._helpers.forEach((helper, index) => {
            helper.setInHandle(anchors[index].inHandle);
            helper.setPoint(anchors[index].point);
            helper.setOutHandle(anchors[index].outHandle);
        });
    }

    public setAnchor(index: number, anchor: CurveAnchor): void {
        // Update rendering
        this.setAnchor(index, anchor);

        // Update helper graphics
        this._helpers[index].setInHandle(anchor.inHandle);
        this._helpers[index].setPoint(anchor.point);
        this._helpers[index].setOutHandle(anchor.outHandle);
    }

    public complete(): void {
        this._helpers.forEach(helper => helper.unrender());
    }
}

export default CurveMutator;
