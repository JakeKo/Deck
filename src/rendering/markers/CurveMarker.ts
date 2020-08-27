import { CurveOutlineRenderer } from '../helpers';
import { ICurveRenderer, IGraphicMarker, ISlideRenderer } from '../types';

type CurveMarkerArgs = {
    slide: ISlideRenderer;
    target: ICurveRenderer;
    scale: number;
};

class CurveMarker implements IGraphicMarker {
    public helper: CurveOutlineRenderer;

    constructor(args: CurveMarkerArgs) {
        this.helper = new CurveOutlineRenderer({
            slide: args.slide,
            scale: args.scale,
            anchors: args.target.anchors,
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

export default CurveMarker;
