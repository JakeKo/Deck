import { ImageRenderer } from "../graphics";
import RectangleOutlineRenderer from "../helpers/RectangleOutlineRenderer";
import SlideRenderer from "../SlideRenderer";
import { GraphicMarker } from "../types";

type ImageMarkerArgs = {
    slide: SlideRenderer;
    target: ImageRenderer;
    scale: number;
};

class RectangleMarker implements GraphicMarker {
    public helper: RectangleOutlineRenderer;

    constructor(args: ImageMarkerArgs) {
        this.helper = new RectangleOutlineRenderer({
            slide: args.slide,
            scale: args.scale,
            origin: args.target.getOrigin(),
            width: args.target.getWidth(),
            height: args.target.getHeight()
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

export default RectangleMarker;
