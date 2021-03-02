import { SlideMouseEvent } from '@/events/types';
import { resolvePosition } from '@/tools/utilities';
import { provideId } from '@/utilities/IdProvider';
import { closestVector } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import { ImageRenderer } from '../graphics';
import { RectangleOutlineRenderer, VertexRenderer } from '../helpers';
import { IImageMaker, IImageRenderer, IRectangleOutlineRenderer, ISlideRenderer, IVertexRenderer, VERTEX_ROLES } from '../types';

type ImageMakerArgs = {
    slide: ISlideRenderer;
    initialPosition: V;
    scale: number;
    source: string;
    dimensions: V;
};

class ImageMaker implements IImageMaker {
    public readonly target: IImageRenderer;
    private _slide: ISlideRenderer;
    private _initialPosition: V;
    private _dimensions: V;
    private _helpers: { [key in VERTEX_ROLES]: IVertexRenderer } & { outline: IRectangleOutlineRenderer };

    constructor(args: ImageMakerArgs) {
        this._slide = args.slide;
        this._initialPosition = args.initialPosition;
        this._dimensions = args.dimensions;

        // Initialize primary graphic
        this.target = new ImageRenderer({
            id: provideId(),
            slide: this._slide,
            origin: this._initialPosition,
            source: args.source,
            dimensions: this._dimensions
        });

        // Initialize helper graphics
        this._helpers = {
            [VERTEX_ROLES.TOP_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.target,
                center: this.target.origin,
                scale: args.scale,
                role: VERTEX_ROLES.TOP_LEFT
            }),
            [VERTEX_ROLES.TOP_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.target,
                center: this.target.origin.addX(this.target.dimensions.x),
                scale: args.scale,
                role: VERTEX_ROLES.TOP_RIGHT
            }),
            [VERTEX_ROLES.BOTTOM_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.target,
                center: this.target.origin.addY(this.target.dimensions.y),
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_LEFT
            }),
            [VERTEX_ROLES.BOTTOM_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.target,
                center: this.target.origin.add(this.target.dimensions),
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_RIGHT
            }),
            outline: new RectangleOutlineRenderer({
                slide: this._slide,
                scale: args.scale,
                origin: this.target.origin,
                dimensions: this.target.dimensions,
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

            const size = this._dimensions.normalized;
            const directions = [size, size.signAs(V.southeast), size.signAs(V.southwest), size.signAs(V.northwest)];
            const rawOffset = this._initialPosition.towards(position);
            const offset = rawOffset.projectOn(closestVector(rawOffset, directions));

            if (baseEvent.ctrlKey) {
                this.target.origin = this._initialPosition.add(offset.abs.scale(-1));
                this.target.dimensions = offset.abs.scale(2);
            } else {
                this.target.origin = this._initialPosition.add(offset.scale(0.5).add(offset.abs.scale(-0.5)));
                this.target.dimensions = offset.abs;
            }

            // Update helper graphics
            this._helpers[VERTEX_ROLES.TOP_LEFT].center = this.target.origin;
            this._helpers[VERTEX_ROLES.TOP_RIGHT].center = this.target.origin.addX(this.target.dimensions.x);
            this._helpers[VERTEX_ROLES.BOTTOM_LEFT].center = this.target.origin.addY(this.target.dimensions.y);
            this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].center = this.target.origin.add(this.target.dimensions);
            this._helpers.outline.origin = this.target.origin;
            this._helpers.outline.dimensions = this.target.dimensions;
        };
    }
}

export default ImageMaker;
