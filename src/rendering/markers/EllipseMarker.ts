import { EllipseOutlineRenderer } from '../helpers';
import { IEllipseRenderer, IGraphicMarker, ISlideRenderer } from '../types';

type EllipseMarkerArgs = {
    slide: ISlideRenderer;
    target: IEllipseRenderer;
    scale: number;
};

class EllipseMarker implements IGraphicMarker {
    public helper: EllipseOutlineRenderer;

    constructor(args: EllipseMarkerArgs) {
        this.helper = new EllipseOutlineRenderer({
            slide: args.slide,
            scale: args.scale,
            center: args.target.center,
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

export default EllipseMarker;
