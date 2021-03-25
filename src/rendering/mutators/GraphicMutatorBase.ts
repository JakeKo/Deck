import { SlideMouseEvent } from "@/events/types";
import { GraphicMutableSerialized } from "@/types";
import V from "@/utilities/Vector";
import { SnapVectorRenderer } from "../helpers";
import {
    BoundingBoxMutatorHelpers,
    GRAPHIC_TYPES,
    IGraphicRenderer,
    ISlideRenderer,
    VERTEX_ROLES
} from "../types";
import {
    makeBoxHelpers,
    makeSnapVectors,
    renderBoxHelpers,
    scaleBoxHelpers,
    unrenderBoxHelpers,
    updateBoxHelpers
} from "../utilities";

// TODO: Implement better type inference here so passing in a generic could look something like the following
// abstract class GraphicMutatorBase<T extends Graphic> => GraphicType<T>, Renderer<T>, MutableProps<T>
abstract class GraphicMutatorBase<S extends GRAPHIC_TYPES, T extends IGraphicRenderer, U extends GraphicMutableSerialized> {
    public readonly type: S;

    protected helpers: BoundingBoxMutatorHelpers & { snapVectors: SnapVectorRenderer[] };
    protected graphicId: string;
    protected slide: ISlideRenderer;
    protected isFocusing: boolean;
    protected isMoving: boolean;

    constructor({
        slide,
        scale,
        graphicId,
        type,
        focus = true
    }: {
        slide: ISlideRenderer,
        scale: number,
        graphicId: string,
        type: S,
        focus?: boolean
    }) {
        this.slide = slide;
        this.type = type;
        this.graphicId = graphicId;
        this.isFocusing = false;
        this.isMoving = false;

        this.helpers = {
            ...makeBoxHelpers(this.graphic, this.slide, scale),
            snapVectors: makeSnapVectors(this.slide, scale)
        };

        if (focus) {
            this.focus();
        }
    }

    protected get graphic(): T {
        return this.slide.getGraphic(this.graphicId) as T;
    }

    public set scale(scale: number) {
        scaleBoxHelpers(this.helpers, scale);
        this.helpers.snapVectors.forEach(s => (s.scale = scale));
    }

    /**
     * Updates the rendered helper graphics with the latest state of this mutator's targeted graphic.
     */
    public updateHelpers(): void {
        if (!this.isFocusing) {
            return;
        }

        const graphic = this.graphic;
        updateBoxHelpers(this.helpers, graphic.transformedBox);
    }

    /**
     * Focus the graphic that pertains to this mutator. This will render necessary helper graphics.
     */
    public focus(): void {
        if (this.isFocusing) {
            return;
        }

        this.isFocusing = true;
        renderBoxHelpers(this.helpers);
    }

    /**
     * Unfocus the graphic that pertains to this mutator. This will unrender all helper graphics.
     */
    public unfocus(): void {
        if (!this.isFocusing) {
            return;
        }

        this.isFocusing = false;
        unrenderBoxHelpers(this.helpers);
        this.helpers.snapVectors.forEach(s => s.unrender());
    }

    abstract initMove(initialPosition: V): (event: SlideMouseEvent) => U;
    abstract endMove(): void;
    abstract vertexListener(role: VERTEX_ROLES): (event: SlideMouseEvent) => U;
    abstract rotateListener(): (event: SlideMouseEvent) => U;
    abstract moveListener(initialPosition: V): (event: SlideMouseEvent) => U;
}

export default GraphicMutatorBase;
