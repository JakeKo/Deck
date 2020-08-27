import { CurveOutlineRenderer } from '../helpers';
import SlideRenderer from '../SlideRenderer';
import { GraphicMarker, ICurveRenderer } from '../types';

type CurveMarkerArgs = {
    slide: SlideRenderer;
    target: ICurveRenderer;
    scale: number;
};

class CurveMarker implements GraphicMarker {
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

    public unmark(): void {
        this.helper.unrender();
    }

    public setScale(scale: number): void {
        this.helper.scale = scale;
    }
}

export default CurveMarker;
