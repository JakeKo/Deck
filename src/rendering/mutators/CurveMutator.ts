import Vector from "../../utilities/Vector";
import { CurveRenderer } from "../graphics";
import { CurveAnchorRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { CurveAnchor, GraphicMutator, GRAPHIC_TYPES } from "../types";

type CurveMutatorArgs = {
    target: CurveRenderer;
    slide: SlideRenderer;
    scale: number;
};

class CurveMutator implements GraphicMutator {
    private _target: CurveRenderer;
    private _slide: SlideRenderer;
    private _helpers: CurveAnchorRenderer[];

    constructor(args: CurveMutatorArgs) {
        this._target = args.target;
        this._slide = args.slide;
        this._helpers = this._target.getAnchors().map(anchor => new CurveAnchorRenderer({
            slide: this._slide,
            scale: args.scale,
            ...anchor
        }));

        this._helpers.forEach(helper => helper.render());
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.CURVE;
    }

    public getTarget(): CurveRenderer {
        return this._target;
    }

    public getOrigin(): Vector {
        return this._target.getAnchor(0).point;
    }

    // TODO: Account for shift, alt, and snapping
    public move(origin: Vector): void {
        // Update rendering
        const delta = this._target.getAnchor(0).point.towards(origin);
        const newAnchors = this._target.getAnchors().map(anchor => ({
            inHandle: anchor.inHandle.add(delta),
            point: anchor.point.add(delta),
            outHandle: anchor.outHandle.add(delta)
        }));
        this._target.setAnchors(newAnchors);
        this._repositionCurveAnchors();
    }

    // TODO: Account for shift, alt, and snapping
    public setAnchor(index: number, anchor: CurveAnchor): void {
        // Update rendering
        this.setAnchor(index, anchor);
        this._repositionCurveAnchor(index);
    }

    // TODO: Implement rectangular scaling
    // TODO: Assess how CurveAnchorMutator interfaces with SlideRenderer focuesed graphics

    public complete(): void {
        this._helpers.forEach(helper => helper.unrender());
    }

    public setScale(scale: number): void {
        this._helpers.forEach(helper => helper.setScale(scale));
    }

    private _repositionCurveAnchor(index: number): void {
        const anchor = this._target.getAnchor(index);
        this._helpers[index].setInHandle(anchor.inHandle);
        this._helpers[index].setPoint(anchor.point);
        this._helpers[index].setOutHandle(anchor.outHandle);
    }

    private _repositionCurveAnchors(): void {
        this._helpers.forEach((_, index) => this._repositionCurveAnchor(index));
    }
}

export default CurveMutator;
