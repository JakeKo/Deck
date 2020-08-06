import { TextboxRenderer } from "../graphics";
import { RectangleOutlineRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMarker } from "../types";

type TextboxMarkerArgs = {
    slide: SlideRenderer;
    target: TextboxRenderer;
    scale: number;
};

class TextboxMarker implements GraphicMarker {
    public helper: RectangleOutlineRenderer;

    constructor(args: TextboxMarkerArgs) {
        this.helper = new RectangleOutlineRenderer({
            slide: args.slide,
            scale: args.scale,
            origin: args.target.getOrigin(),
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

export default TextboxMarker;
