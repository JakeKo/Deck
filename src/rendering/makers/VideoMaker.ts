import { provideId } from '@/utilities/IdProvider';
import { closestVector } from '@/utilities/utilities';
import Vector from '@/utilities/Vector';
import { VideoRenderer } from '../graphics';
import { RectangleOutlineRenderer, VertexRenderer } from '../helpers';
import SlideRenderer from '../SlideRenderer';
import { GraphicMaker, IVideoRenderer, VERTEX_ROLES } from '../types';

type VideoMakerArgs = {
    slide: SlideRenderer;
    initialPosition: Vector;
    scale: number;
    source: HTMLVideoElement;
    width: number;
    height: number;
};

type VideoMakerHelpers = { [key in VERTEX_ROLES]: VertexRenderer } & {
    outline: RectangleOutlineRenderer;
};

class VideoMaker implements GraphicMaker {
    public readonly target: IVideoRenderer;
    private _slide: SlideRenderer;
    private _initialPosition: Vector;
    private _width: number;
    private _height: number;
    private _helpers: VideoMakerHelpers;

    constructor(args: VideoMakerArgs) {
        this._slide = args.slide;
        this._initialPosition = args.initialPosition;
        this._width = args.width;
        this._height = args.height;

        // Initialize primary graphic
        this.target = new VideoRenderer({
            id: provideId(),
            slide: this._slide,
            origin: this._initialPosition,
            source: args.source,
            dimensions: new Vector(args.width, args.height)
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
                center: this.target.origin.add(new Vector(this.target.dimensions.x, 0)),
                scale: args.scale,
                role: VERTEX_ROLES.TOP_RIGHT
            }),
            [VERTEX_ROLES.BOTTOM_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.target,
                center: this.target.origin.add(new Vector(0, this.target.dimensions.y)),
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

    // Some trig, for your enjoyment
    public resize(position: Vector, shift: boolean, ctrl: boolean, alt: boolean): void {
        const size = new Vector(this._width, this._height).normalized;
        const directions = [size, size.signAs(Vector.southeast), size.signAs(Vector.southwest), size.signAs(Vector.northwest)];
        const rawOffset = this._initialPosition.towards(position);
        const offset = rawOffset.projectOn(closestVector(rawOffset, directions));

        if (ctrl) {
            this.target.origin = this._initialPosition.add(offset.abs.scale(-1));
            this.target.dimensions = offset.abs.scale(2);
        } else {
            this.target.origin = this._initialPosition.add(offset.scale(0.5).add(offset.abs.scale(-0.5)));
            this.target.dimensions = offset.abs;
        }

        // Update helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].center = this.target.origin;
        this._helpers[VERTEX_ROLES.TOP_RIGHT].center = this.target.origin.add(new Vector(this.target.dimensions.x, 0));
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].center = this.target.origin.add(new Vector(0, this.target.dimensions.y));
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].center = this.target.origin.add(this.target.dimensions);
        this._helpers.outline.origin = this.target.origin;
        this._helpers.outline.dimensions = this.target.dimensions;
    }
}

export default VideoMaker;
