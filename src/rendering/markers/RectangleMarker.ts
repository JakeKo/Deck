import { RectangleOutlineRenderer } from '../helpers';
import { IGraphicMarker, IRectangleRenderer, ISlideRenderer } from '../types';

type RectangleMarkerArgs = {
    slide: ISlideRenderer;
    target: IRectangleRenderer;
    scale: number;
};

class RectangleMarker implements IGraphicMarker {
    public helper: RectangleOutlineRenderer;

    constructor(args: RectangleMarkerArgs) {
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

export default RectangleMarker;
