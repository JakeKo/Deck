import Vector from "../../utilities/Vector";
import { CurveRenderer } from "../graphics";
import { CurveAnchorRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { CurveAnchor, GraphicMutator, GRAPHIC_TYPES } from "../types";

type CurveMutatorArgs = {
    curve: CurveRenderer;
    slide: SlideRenderer;
};

class CurveMutator implements GraphicMutator {
    private _curve: CurveRenderer;
    private _slide: SlideRenderer;
    private _helpers: CurveAnchorRenderer[];

    constructor(args: CurveMutatorArgs) {
        this._curve = args.curve;
        this._slide = args.slide;
        this._helpers = this._curve.getAnchors().map(anchor => new CurveAnchorRenderer({ slide: this._slide, ...anchor }));
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.CURVE;
    }

    public getTarget(): CurveRenderer {
        return this._curve;
    }

    // TODO: Account for shift, alt, and snapping
    public move(origin: Vector): void {
        // Update rendering
        const delta = this._curve.getAnchor(0).point.towards(origin);
        const newAnchors = this._curve.getAnchors().map(anchor => ({
            inHandle: anchor.inHandle.add(delta),
            point: anchor.point.add(delta),
            outHandle: anchor.outHandle.add(delta)
        }));
        this._curve.setAnchors(newAnchors);

        // Update helper graphics
        const anchors = this._curve.getAnchors();
        this._helpers.forEach((helper, index) => {
            helper.setInHandle(anchors[index].inHandle);
            helper.setPoint(anchors[index].point);
            helper.setOutHandle(anchors[index].outHandle);
        });
    }

    // TODO: Account for shift, alt, and snapping
    public setAnchor(index: number, anchor: CurveAnchor): void {
        // Update rendering
        this.setAnchor(index, anchor);

        // Update helper graphics
        this._helpers[index].setInHandle(anchor.inHandle);
        this._helpers[index].setPoint(anchor.point);
        this._helpers[index].setOutHandle(anchor.outHandle);
    }

    // TODO: Implement rectangular scaling
    // TODO: Assess how CurveAnchorMutator interfaces with SlideRenderer focuesed graphics

    public complete(): void {
        this._helpers.forEach(helper => helper.unrender());
    }
}

export default CurveMutator;
