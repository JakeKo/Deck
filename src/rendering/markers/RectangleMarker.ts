import { RectangleOutlineRenderer } from '../helpers';
import SlideRenderer from '../SlideRenderer';
import { GraphicMarker, IRectangleRenderer } from '../types';

type RectangleMarkerArgs = {
    slide: SlideRenderer;
    target: IRectangleRenderer;
    scale: number;
};

class RectangleMarker implements GraphicMarker {
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

    public unmark(): void {
        this.helper.unrender();
    }

    public setScale(scale: number): void {
        this.helper.scale = scale;
    }
}

export default RectangleMarker;
