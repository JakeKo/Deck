import { SlideMouseEvent } from '@/events/types';
import { resolvePosition } from '@/tools/utilities';
import { provideId } from '@/utilities/IdProvider';
import { closestVector } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import { EllipseRenderer } from '../graphics';
import { EllipseOutlineRenderer, VertexRenderer } from '../helpers';
import { IEllipseMaker, IEllipseOutlineRenderer, IEllipseRenderer, ISlideRenderer, IVertexRenderer, VERTEX_ROLES } from '../types';

type EllipseMakerArgs = {
    slide: ISlideRenderer;
    initialPosition: V;
    scale: number;
};

class EllipseMaker implements IEllipseMaker {
    public readonly target: IEllipseRenderer;
    private _slide: ISlideRenderer;
    private _initialPosition: V;
    private _helpers: { [key in VERTEX_ROLES]: IVertexRenderer } & { outline: IEllipseOutlineRenderer };

    constructor(args: EllipseMakerArgs) {
        this._slide = args.slide;
        this._initialPosition = args.initialPosition;

        // TODO: Aggregate snap vectors here
        // Initialize primary graphic
        this.target = new EllipseRenderer({
            id: provideId(),
            slide: this._slide,
            center: this._initialPosition
        });

        // Initialize helper graphics
        this._helpers = {
            [VERTEX_ROLES.TOP_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.target,
                center: this.target.center,
                scale: args.scale,
                role: VERTEX_ROLES.TOP_LEFT
            }),
            [VERTEX_ROLES.TOP_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.target,
                center: this.target.center.addX(this.target.dimensions.x),
                scale: args.scale,
                role: VERTEX_ROLES.TOP_RIGHT
            }),
            [VERTEX_ROLES.BOTTOM_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.target,
                center: this.target.center.addY(this.target.dimensions.y),
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_LEFT
            }),
            [VERTEX_ROLES.BOTTOM_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.target,
                center: this.target.center.add(this.target.dimensions),
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_RIGHT
            }),
            outline: new EllipseOutlineRenderer({
                slide: this._slide,
                center: this.target.center,
                dimensions: this.target.dimensions,
                scale: args.scale,
                rotation: this.target.rotation
            })
        };

        // Render primary graphic
        this.target.render();

        // Render helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].render();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].render();
        this._helpers.outline.render();
    }

    public set scale(scale: number) {
        this._helpers[VERTEX_ROLES.TOP_LEFT].scale = scale;
        this._helpers[VERTEX_ROLES.TOP_RIGHT].scale = scale;
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].scale = scale;
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].scale = scale;
        this._helpers.outline.scale = scale;
    }

    public complete(): void {
        this._slide.setGraphic(this.target);

        // Remove helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].unrender();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].unrender();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].unrender();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].unrender();
        this._helpers.outline.unrender();
    }

    public resizeListener(): (event: SlideMouseEvent) => void {
        return event => {
            const { baseEvent, slide } = event.detail;
            const position = resolvePosition(baseEvent, slide);

            // If shift is pressed, constrain to circle
            const directions = [V.northeast, V.northwest, V.southeast, V.southwest];
            const rawOffset = this._initialPosition.towards(position);
            const offset = baseEvent.shiftKey ? rawOffset.projectOn(closestVector(rawOffset, directions)) : rawOffset;

            if (baseEvent.ctrlKey) {
                this.target.center = this._initialPosition;
                this.target.dimensions = offset.abs.scale(2);
            } else {
                this.target.center = this._initialPosition.add(offset.scale(0.5));
                this.target.dimensions = offset.abs;
            }

            // Update helper graphics
            const center = this.target.center;
            const radius = this.target.dimensions.scale(0.5);
            this._helpers[VERTEX_ROLES.TOP_LEFT].center = center.add(radius.scale(-1));
            this._helpers[VERTEX_ROLES.TOP_RIGHT].center = center.add(radius.signAs(V.southeast));
            this._helpers[VERTEX_ROLES.BOTTOM_LEFT].center = center.add(radius);
            this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].center = center.add(radius.signAs(V.northwest));
            this._helpers.outline.center = center;
            this._helpers.outline.dimensions = this.target.dimensions;
        };
    }
}

export default EllipseMaker;
