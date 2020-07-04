import { provideId } from "../../utilities/IdProvider";
import { CurveRenderer } from "../graphics";
import { CurveAnchorRenderer } from '../helpers';
import SlideRenderer from "../SlideRenderer";
import { CurveAnchor } from "../types";

type CurveMakerArgs = {
    slide: SlideRenderer;
};

// TODO: Reduce helpers to a single CurveAnchorRenderer
class CurveMaker {
    private _curve: CurveRenderer;
    private _slide: SlideRenderer;
    private _helpers: CurveAnchorRenderer[];

    constructor(args: CurveMakerArgs) {
        this._slide = args.slide;
        this._helpers = [];

        // Inititalize primary graphic
        this._curve = new CurveRenderer({
            id: provideId(),
            slideRenderer: this._slide
        });

        // Render primary graphic
        this._curve.render();
    }

    public addAnchor(anchor: CurveAnchor): number {
        // Update rendering
        const anchorIndex = this._curve.addAnchor(anchor);

        // Update helper graphics
        this._helpers.push(new CurveAnchorRenderer({ canvas: this._slide.canvas, ...anchor }));
        this._helpers[anchorIndex].render();

        return anchorIndex;
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
        this._slide.persistGraphic(this._curve);

        // Remove helper graphics
        this._helpers.forEach(helper => helper.unrender());
    }
}

export default CurveMaker;
