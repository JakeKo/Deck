import { provideId } from "../../utilities/IdProvider";
import Vector from "../../utilities/Vector";
import { CurveRenderer } from "../graphics";
import { CurveAnchorRenderer } from '../helpers';
import SlideRenderer from "../SlideRenderer";
import { CurveAnchor } from "../types";

type CurveMakerArgs = {
    slide: SlideRenderer;
    initialPosition: Vector;
};

class CurveMaker {
    private _curve: CurveRenderer;
    private _slide: SlideRenderer;
    private _helper: CurveAnchorRenderer;

    constructor(args: CurveMakerArgs) {
        this._slide = args.slide;

        // Inititalize primary graphic
        this._curve = new CurveRenderer({
            id: provideId(),
            slideRenderer: this._slide,
            anchors: [{ point: args.initialPosition }]
        });

        // Initialize helper graphic
        this._helper = new CurveAnchorRenderer({ canvas: this._slide.canvas, point: args.initialPosition });

        // Render primary graphic
        this._curve.render();

        // Render helper graphic
        this._helper.render();
    }

    public addAnchor(anchor: CurveAnchor): number {
        // Update helper graphic
        this._helper.setInHandle(anchor.inHandle);
        this._helper.setPoint(anchor.point);
        this._helper.setOutHandle(anchor.outHandle);

        return this._curve.addAnchor(anchor);
    }

    public setAnchor(index: number, anchor: CurveAnchor): void {
        // Update rendering
        this.setAnchor(index, anchor);

        // Update helper graphic
        this._helper.setInHandle(anchor.inHandle);
        this._helper.setPoint(anchor.point);
        this._helper.setOutHandle(anchor.outHandle);
    }

    public complete(): void {
        this._slide.persistGraphic(this._curve);

        // Remove helper graphics
        this._helper.unrender();
    }
}

export default CurveMaker;
