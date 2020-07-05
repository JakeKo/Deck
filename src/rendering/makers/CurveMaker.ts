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
            slideRenderer: this._slide
        });

        // Initialize helper graphic
        this._helper = new CurveAnchorRenderer({
            canvas: this._slide.canvas,
            inHandle: args.initialPosition,
            point: args.initialPosition,
            outHandle: args.initialPosition
        });

        // Render primary graphic
        this._curve.render();

        // Render helper graphic
        this._helper.render();
    }

    public addAnchor(anchor: CurveAnchor): { setHandles: (position: Vector) => void, setPoint: (position: Vector) => void } {
        const anchorIndex = this._curve.addAnchor(anchor);

        // Update helper graphic
        this._helper.setInHandle(anchor.inHandle);
        this._helper.setPoint(anchor.point);
        this._helper.setOutHandle(anchor.outHandle);

        return {
            setHandles: position => {
                anchor.inHandle = position.reflect(anchor.point);
                anchor.outHandle = position;
                this._curve.setAnchor(anchorIndex, anchor);
                this._helper.setInHandle(anchor.inHandle);
                this._helper.setOutHandle(anchor.outHandle);
            },
            setPoint: position => {
                anchor.point = position;
                this._curve.setAnchor(anchorIndex, anchor);
                this._helper.setPoint(anchor.point);
            }
        };
    }

    public complete(): void {
        // Trim the last anchor and persist
        this._curve.removeAnchor(this._curve.getAnchors().length - 1);
        this._slide.persistGraphic(this._curve);

        // Remove helper graphics
        this._helper.unrender();
    }
}

export default CurveMaker;
