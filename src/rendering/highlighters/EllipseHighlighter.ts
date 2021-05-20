import { EllipseOutlineRenderer } from '../helpers';
import { IEllipseRenderer, IGraphicCreator, ISlideRenderer } from '../types';

class EllipseHighlighter implements IGraphicCreator {
    protected helper: EllipseOutlineRenderer;

    constructor({
        slide,
        target,
        scale
    }: {
        slide: ISlideRenderer;
        target: IEllipseRenderer;
        scale: number;
    }) {
        this.helper = new EllipseOutlineRenderer({
            slide,
            scale,
            center: target.center,
            dimensions: target.dimensions,
            rotation: target.rotation
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

export default EllipseHighlighter;
