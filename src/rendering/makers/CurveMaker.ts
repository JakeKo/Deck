import { provideId } from '@/utilities/IdProvider';
import Vector from '@/utilities/Vector';
import { CurveRenderer } from '../graphics';
import { CurveAnchorRenderer } from '../helpers';
import SlideRenderer from '../SlideRenderer';
import { CurveAnchor, GraphicMaker } from '../types';

type CurveMakerArgs = {
    slide: SlideRenderer;
    initialPosition: Vector;
    scale: number;
};

class CurveMaker implements GraphicMaker {
    private _target: CurveRenderer;
    private _slide: SlideRenderer;
    private _helper: CurveAnchorRenderer;

    constructor(args: CurveMakerArgs) {
        this._slide = args.slide;

        // Inititalize primary graphic
        this._target = new CurveRenderer({
            id: provideId(),
            slide: this._slide
        });

        // Initialize helper graphic
        this._helper = new CurveAnchorRenderer({
            slide: this._slide,
            scale: args.scale,
            inHandle: args.initialPosition,
            point: args.initialPosition,
            outHandle: args.initialPosition,
            parentId: this._target.getId(),
            index: -1
        });

        // Render primary graphic
        this._target.render();

        // Render helper graphic
        this._helper.render();
    }

    public getTarget(): CurveRenderer {
        return this._target;
    }

    // TODO: Consider returning graphic so setGraphic may be called outside makers
    public complete(): void {
        // Trim the last anchor and persist
        this._target.removeAnchor(this._target.getAnchors().length - 1);
        this._slide.setGraphic(this._target);

        // Remove helper graphics
        this._helper.unrender();
    }

    public setScale(scale: number): void {
        this._helper.setScale(scale);
    }

    public addAnchor(anchor: CurveAnchor): { setHandles: (position: Vector) => void; setPoint: (position: Vector) => void } {
        const anchorIndex = this._target.addAnchor(anchor);

        // Update helper graphic
        this._helper.setInHandle(anchor.inHandle);
        this._helper.setPoint(anchor.point);
        this._helper.setOutHandle(anchor.outHandle);

        return {
            setHandles: position => {
                anchor.inHandle = position.reflect(anchor.point);
                anchor.outHandle = position;
                this._target.setAnchor(anchorIndex, anchor);
                this._helper.setInHandle(anchor.inHandle);
                this._helper.setOutHandle(anchor.outHandle);
            },
            setPoint: position => {
                anchor.point = position;
                this._target.setAnchor(anchorIndex, anchor);
                this._helper.setPoint(anchor.point);
            }
        };
    }
}

export default CurveMaker;
