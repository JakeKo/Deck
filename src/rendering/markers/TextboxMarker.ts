import { RectangleOutlineRenderer } from '../helpers';
import { IGraphicMarker, ISlideRenderer, ITextboxRenderer } from '../types';

type TextboxMarkerArgs = {
    slide: ISlideRenderer;
    target: ITextboxRenderer;
    scale: number;
};

class TextboxMarker implements IGraphicMarker {
    public helper: RectangleOutlineRenderer;

    constructor(args: TextboxMarkerArgs) {
        this.helper = new RectangleOutlineRenderer({
            slide: args.slide,
            scale: args.scale,
            origin: args.target.origin,
            dimensions: args.target.dimensions,
            rotation: args.target.rotation
        });

        this.helper.render();
    }

    public set scale(scale: number) {
        this.helper.scale = scale;
    }

    public unmark(): void {
        this.helper.unrender();
    }
}

export default TextboxMarker;
