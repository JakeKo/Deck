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
    public helper: CurveOutlineRenderer;

    constructor(args: CurveMarkerArgs) {
        this.helper = new CurveOutlineRenderer({
            slide: args.slide,
            scale: args.scale,
            anchors: args.target.getAnchors()
        });

        this.helper.render();
    }

    public unmark(): void {
        this.helper.unrender();
    }

    public setScale(scale: number): void {
        this.helper.setScale(scale);
    }
}

export default CurveMarker;
