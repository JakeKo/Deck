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
    public helper: EllipseOutlineRenderer;

    constructor(args: EllipseMarkerArgs) {
        this.helper = new EllipseOutlineRenderer({
            slide: args.slide,
            scale: args.scale,
            center: args.target.getCenter(),
            width: args.target.getWidth(),
            height: args.target.getHeight(),
            rotation: args.target.getRotation()
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

export default EllipseMarker;
