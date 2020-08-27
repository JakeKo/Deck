import { EllipseOutlineRenderer } from '../helpers';
import SlideRenderer from '../SlideRenderer';
import { GraphicMarker, IEllipseRenderer } from '../types';

type EllipseMarkerArgs = {
    slide: SlideRenderer;
    target: IEllipseRenderer;
    scale: number;
};

class EllipseMarker implements GraphicMarker {
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

    public unmark(): void {
        this.helper.unrender();
    }

    public setScale(scale: number): void {
        this.helper.scale = scale;
    }
}

export default EllipseMarker;
