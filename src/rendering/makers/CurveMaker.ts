import CurveRenderer from "../graphics/CurveRenderer";
import SlideRenderer from "../SlideRenderer";
import CurveAnchorRenderer from "../helpers/CurveAnchorRenderer";
import Vector from "../../models/Vector";
import { CurveAnchor } from "../types";

type CurveMakerArgs = {
    curve: CurveRenderer;
    slide: SlideRenderer;
};

class CurveMaker {
    private _curve: CurveRenderer;
    private _slide: SlideRenderer;
    private _helpers: CurveAnchorRenderer[];

    constructor(args: CurveMakerArgs) {
        this._curve = args.curve;
        this._slide = args.slide;
        this._helpers = [];
    }

    public move(origin: Vector): void {
        // Update rendering
        this._curve.move(origin);

        // Update helper graphics
    }

    public addAnchor(anchor: CurveAnchor): number {
        // Update rendering

        // Update helper graphics
    }

    public setAnchor(index: number, anchor: CurveAnchor): void {
        // Update rendering

        // Update helper graphics
    }

    public complete(): void {

    }
}

export default CurveMaker;
