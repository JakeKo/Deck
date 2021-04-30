import { SlideMouseEvent } from '@/events/types';
import { resolvePosition } from '@/tools/utilities';
import { EllipseMutableSerialized, EllipseSerialized } from '@/types';
import { closestVector } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import { EllipseOutlineRenderer, VertexRenderer } from '../helpers';
import { IEllipseMaker, IEllipseOutlineRenderer, IEllipseRenderer, ISlideRenderer, IVertexRenderer, VERTEX_ROLES } from '../types';

class EllipseMaker implements IEllipseMaker {
    protected helpers: ({ [key in VERTEX_ROLES]: IVertexRenderer } & { outline: IEllipseOutlineRenderer }) | undefined;
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

    protected get graphic(): IEllipseRenderer {
        return this.slide.getGraphic(this.graphicId) as IEllipseRenderer;
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
            const { center, dimensions } = this.graphic;
            const radius = dimensions.scale(0.5);
            this.helpers[VERTEX_ROLES.TOP_LEFT].center = center.add(radius.neg);
            this.helpers[VERTEX_ROLES.TOP_RIGHT].center = center.add(radius.signAs(V.southeast));
            this.helpers[VERTEX_ROLES.BOTTOM_LEFT].center = center.add(radius);
            this.helpers[VERTEX_ROLES.BOTTOM_RIGHT].center = center.add(radius.signAs(V.northwest));
            this.helpers.outline.center = center;
            this.helpers.outline.dimensions = dimensions;
        }
    }

    /**
     * Creates a serialized form of the target graphic given the provided props.
     */
    public create(props: EllipseMutableSerialized): EllipseSerialized {
        if (this.isCreated) {
            throw new Error(`Graphic with id ${this.graphicId} already created`);
        }

        this.isCreated = true;
        const graphic = {
            id: this.graphicId,
            type: 'ellipse',
            center: new V(props.center?.x ?? 0, props.center?.y ?? 0),
            dimensions: new V(props.dimensions?.x ?? 0, props.dimensions?.y ?? 0),
            fillColor: props.fillColor ?? '#CCCCCC',
            strokeColor: props.strokeColor ?? 'none',
            strokeWidth: props.strokeWidth ?? 0,
            rotation: props.rotation ?? 0
        } as EllipseSerialized;

        const center = V.from(graphic.center);
        const dimensions = V.from(graphic.dimensions);

        this.helpers = {
            [VERTEX_ROLES.TOP_LEFT]: new VertexRenderer({
                slide: this.slide,
                parentId: graphic.id,
                center,
                scale: this.helpersScale,
                role: VERTEX_ROLES.TOP_LEFT
            }),
            [VERTEX_ROLES.TOP_RIGHT]: new VertexRenderer({
                slide: this.slide,
                parentId: graphic.id,
                center: center.addX(dimensions.x),
                scale: this.helpersScale,
                role: VERTEX_ROLES.TOP_RIGHT
            }),
            [VERTEX_ROLES.BOTTOM_LEFT]: new VertexRenderer({
                slide: this.slide,
                parentId: graphic.id,
                center: center.addY(dimensions.y),
                scale: this.helpersScale,
                role: VERTEX_ROLES.BOTTOM_LEFT
            }),
            [VERTEX_ROLES.BOTTOM_RIGHT]: new VertexRenderer({
                slide: this.slide,
                parentId: graphic.id,
                center: center.add(dimensions),
                scale: this.helpersScale,
                role: VERTEX_ROLES.BOTTOM_RIGHT
            }),
            outline: new EllipseOutlineRenderer({
                slide: this.slide,
                center,
                dimensions,
                scale: this.helpersScale,
                rotation: graphic.rotation
            })
        };

        return graphic;
    }

    /**
     * Initialize this maker to begin tracking movement for the purpose of resizing.
     * This returns a handler to be called on each subsequent mouse event.
     */
    public initResize(basePoint: V): (event: SlideMouseEvent) => EllipseMutableSerialized {
        this.isResizing = true;

        if (this.helpers) {
            this.updateHelpers();
            this.helpers[VERTEX_ROLES.TOP_LEFT].render();
            this.helpers[VERTEX_ROLES.TOP_RIGHT].render();
            this.helpers[VERTEX_ROLES.BOTTOM_LEFT].render();
            this.helpers[VERTEX_ROLES.BOTTOM_RIGHT].render();
            this.helpers.outline.render();
        }

        return event => {
            const { baseEvent, slide } = event.detail;
            const position = resolvePosition(baseEvent, slide);

            const rawOffset = basePoint.towards(position);
            const offset = baseEvent.shiftKey ? rawOffset.projectOn(closestVector(rawOffset, V.intermediates)) : rawOffset;

            const center = baseEvent.ctrlKey ? basePoint : basePoint.add(offset.scale(0.5));
            const dimensions = baseEvent.ctrlKey ? offset.abs.scale(2) : offset.abs;

            return { center, dimensions };
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

export default EllipseMaker;
