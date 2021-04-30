import { SlideMouseEvent } from '@/events/types';
import { resolvePosition } from '@/tools/utilities';
import { VideoMutableSerialized, VideoSerialized } from '@/types';
import { closestVector } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import { RectangleOutlineRenderer, VertexRenderer } from '../helpers';
import { IRectangleOutlineRenderer, ISlideRenderer, IVertexRenderer, IVideoMaker, IVideoRenderer, VERTEX_ROLES } from '../types';

class VideoMaker implements IVideoMaker {
    protected helpers: ({ [key in VERTEX_ROLES]: IVertexRenderer } & { outline: IRectangleOutlineRenderer }) | undefined;
    protected graphicId: string;
    protected slide: ISlideRenderer;
    protected isResizing: boolean;
    protected isCreated: boolean;
    protected helpersScale: number;

    constructor({
        slide,
        scale,
        graphicId
    }: {
        slide: ISlideRenderer;
        scale: number;
        graphicId: string;
    }) {
        this.graphicId = graphicId;
        this.slide = slide;
        this.isResizing = false;
        this.isCreated = false;
        this.helpersScale = scale;
    }

    protected get graphic(): IVideoRenderer {
        return this.slide.getGraphic(this.graphicId) as IVideoRenderer;
    }

    public set scale(scale: number) {
        this.helpersScale = scale;

        if (this.helpers) {
            this.helpers[VERTEX_ROLES.TOP_LEFT].scale = scale;
            this.helpers[VERTEX_ROLES.TOP_RIGHT].scale = scale;
            this.helpers[VERTEX_ROLES.BOTTOM_LEFT].scale = scale;
            this.helpers[VERTEX_ROLES.BOTTOM_RIGHT].scale = scale;
            this.helpers.outline.scale = scale;
        }
    }

    /**
     * Updates the rendered helper graphics with the latest state of this maker's targeted graphic.
     */
    public updateHelpers(): void {
        if (!this.isResizing) {
            return;
        }

        if (this.helpers) {
            const { origin, dimensions } = this.graphic;
            this.helpers[VERTEX_ROLES.TOP_LEFT].center = origin;
            this.helpers[VERTEX_ROLES.TOP_RIGHT].center = origin.addX(dimensions.x);
            this.helpers[VERTEX_ROLES.BOTTOM_LEFT].center = origin.addY(dimensions.y);
            this.helpers[VERTEX_ROLES.BOTTOM_RIGHT].center = origin.add(dimensions);
            this.helpers.outline.origin = origin;
            this.helpers.outline.dimensions = dimensions;
        }
    }

    /**
     * Creates a serialized form of the target graphic given the provided props.
     */
    public create(props: VideoMutableSerialized & Pick<VideoSerialized, 'source' | 'dimensions'>): VideoSerialized {
        if (this.isCreated) {
            throw new Error(`Graphic with id ${this.graphicId} already created`);
        }

        this.isCreated = true;
        const graphic = {
            id: this.graphicId,
            type: 'video',
            source: props.source ?? '',
            origin: new V(props.origin?.x ?? 0, props.origin?.y ?? 0),
            dimensions: new V(props.dimensions?.x ?? 0, props.dimensions?.y ?? 0),
            strokeColor: props.strokeColor ?? 'none',
            strokeWidth: props.strokeWidth ?? 0,
            rotation: props.rotation ?? 0
        } as VideoSerialized;

        const origin = V.from(graphic.origin);
        const dimensions = V.from(graphic.dimensions);

        this.helpers = {
            [VERTEX_ROLES.TOP_LEFT]: new VertexRenderer({
                slide: this.slide,
                parentId: graphic.id,
                center: origin,
                scale: this.helpersScale,
                role: VERTEX_ROLES.TOP_LEFT
            }),
            [VERTEX_ROLES.TOP_RIGHT]: new VertexRenderer({
                slide: this.slide,
                parentId: graphic.id,
                center: origin.addX(dimensions.x),
                scale: this.helpersScale,
                role: VERTEX_ROLES.TOP_RIGHT
            }),
            [VERTEX_ROLES.BOTTOM_LEFT]: new VertexRenderer({
                slide: this.slide,
                parentId: graphic.id,
                center: origin.addY(dimensions.y),
                scale: this.helpersScale,
                role: VERTEX_ROLES.BOTTOM_LEFT
            }),
            [VERTEX_ROLES.BOTTOM_RIGHT]: new VertexRenderer({
                slide: this.slide,
                parentId: graphic.id,
                center: origin.add(dimensions),
                scale: this.helpersScale,
                role: VERTEX_ROLES.BOTTOM_RIGHT
            }),
            outline: new RectangleOutlineRenderer({
                slide: this.slide,
                scale: this.helpersScale,
                origin,
                dimensions,
                rotation: graphic.rotation
            })
        };

        return graphic;
    }

    /**
     * Initialize this maker to begin tracking movement for the purpose of resizing.
     * This returns a handler to be called on each subsequent mouse event.
     */
    public initResize(basePoint: V): (event: SlideMouseEvent) => VideoMutableSerialized {
        this.isResizing = true;

        if (this.helpers) {
            this.updateHelpers();
            this.helpers[VERTEX_ROLES.TOP_LEFT].render();
            this.helpers[VERTEX_ROLES.TOP_RIGHT].render();
            this.helpers[VERTEX_ROLES.BOTTOM_LEFT].render();
            this.helpers[VERTEX_ROLES.BOTTOM_RIGHT].render();
            this.helpers.outline.render();
        }

        const aspectRatio = this.graphic.dimensions;
        const directions = V.intermediates.map(v => aspectRatio.signAs(v));

        return event => {
            const { baseEvent, slide } = event.detail;
            const position = resolvePosition(baseEvent, slide);

            const rawOffset = basePoint.towards(position);
            const offset = rawOffset.projectOn(closestVector(rawOffset, directions));

            const origin = baseEvent.ctrlKey ? basePoint.add(offset.abs.neg) : basePoint.add(offset.scale(0.5).add(offset.abs.scale(-0.5)));
            const dimensions = baseEvent.ctrlKey ? offset.abs.scale(2) : offset.abs;

            return { origin, dimensions };
        };
    }

    /**
     * Conclude tracking of movement for the purpose of resizing.
     */
    public endResize(): void {
        if (!this.isResizing) {
            return;
        }

        this.isResizing = false;
        if (this.helpers) {
            this.helpers[VERTEX_ROLES.TOP_LEFT].unrender();
            this.helpers[VERTEX_ROLES.TOP_RIGHT].unrender();
            this.helpers[VERTEX_ROLES.BOTTOM_LEFT].unrender();
            this.helpers[VERTEX_ROLES.BOTTOM_RIGHT].unrender();
            this.helpers.outline.unrender();
        }
    }
}

export default VideoMaker;
