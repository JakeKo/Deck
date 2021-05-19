import { SlideMouseEvent } from '@/events/types';
import { resolvePosition } from '@/tools/utilities';
import { CurveMutableSerialized, CurveSerialized } from '@/types';
import V from '@/utilities/Vector';
import { CurveAnchorRenderer } from '../helpers';
import { ICurveAnchorRenderer, ICurveMaker, ICurveRenderer, ISlideRenderer } from '../types';

class CurveCreator implements ICurveMaker {
    // TODO: Add a trail prop to track anchor points along the curve
    protected helpers: ({ anchor: ICurveAnchorRenderer }) | undefined;
    protected graphicId: string;
    protected slide: ISlideRenderer;
    protected isDrawing: boolean;
    protected isCreatingAnchor: boolean;
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
        this.isDrawing = false;
        this.isCreatingAnchor = false;
        this.isCreated = false;
        this.helpersScale = scale;
    }

    protected get graphic(): ICurveRenderer {
        return this.slide.getGraphic(this.graphicId) as ICurveRenderer;
    }

    public set scale(scale: number) {
        this.helpersScale = scale;

        if (this.helpers) {
            this.helpers.anchor.scale = scale;
        }
    }

    /**
     * Updates the rendered helper graphics with the latest state of this maker's targeted graphic.
     */
    public updateHelpers(): void {
        if (!this.isDrawing) {
            return;
        }

        const { anchors } = this.graphic;
        if (this.isCreatingAnchor && this.helpers) {
            const lastAnchor = anchors[anchors.length - 1];
            this.helpers.anchor.inHandle = lastAnchor.inHandle;
            this.helpers.anchor.point = lastAnchor.point;
            this.helpers.anchor.outHandle = lastAnchor.outHandle;
        }
    }

    /**
     * Creates a serialized form of the target graphic given the provided props.
     */
    public create(props: CurveMutableSerialized): CurveSerialized {
        if (this.isCreated) {
            throw new Error(`Graphic with id ${this.graphicId} already created`);
        }

        this.isCreated = true;
        const graphic = {
            id: this.graphicId,
            type: 'curve',
            anchors: (props.anchors ?? []).map(anchor => ({
                inHandle: {
                    x: anchor?.inHandle?.x ?? 0,
                    y: anchor?.inHandle?.y ?? 0
                },
                point: {
                    x: anchor?.point?.x ?? 0,
                    y: anchor?.point?.y ?? 0
                },
                outHandle: {
                    x: anchor?.outHandle?.x ?? 0,
                    y: anchor?.outHandle?.y ?? 0
                }
            })),
            fillColor: props.fillColor ?? 'transparent',
            strokeColor: props.strokeColor ?? '#000000',
            strokeWidth: props.strokeWidth ?? 1,
            rotation: props.rotation ?? 0
        } as CurveSerialized;

        this.helpers = {
            anchor: new CurveAnchorRenderer({
                slide: this.slide,
                scale: this.helpersScale,
                inHandle: graphic.anchors[0] ? V.from(graphic.anchors[0].inHandle) : V.zero,
                point: graphic.anchors[0] ? V.from(graphic.anchors[0].point) : V.zero,
                outHandle: graphic.anchors[0] ? V.from(graphic.anchors[0].outHandle) : V.zero,
                parentId: this.graphicId,
                index: -1
            })
        };

        return graphic;
    }

    /**
     * Initialize this maker to begin tracking movement for the purpose of drawing.
     * This returns a handler to be called on each subsequent mouse event (unless the initCreateAnchor handler is called).
     */
    public initDraw(): (event: SlideMouseEvent) => CurveMutableSerialized {
        this.isDrawing = true;

        return event => {
            const { baseEvent, slide } = event.detail;
            const position = resolvePosition(baseEvent, slide);

            const anchorCount = this.graphic.anchors.length;
            return {
                anchors: [
                    ...Array(Math.max(anchorCount - 1, 0)),
                    {
                        inHandle: position,
                        point: position,
                        outHandle: position
                    }
                ]
            };
        };
    }

    /**
     * Conclude tracking of movement for the purpose of drawing.
     * CurveMutableSerialized is returned since the last anchor of the curve must be trimmed off.
     */
    public endDraw(): CurveMutableSerialized {
        if (!this.isDrawing) {
            return {};
        }

        // Force anchor creation to end (if it's not already over)
        this.endCreateAnchor();
        this.isDrawing = false;

        // Trim the last anchor
        return { anchors: this.graphic.anchors.slice(0, -1) };
    }

    /**
     * Utility function for adding an anchor to the curve.
     * Subsequent calls to the initDraw or initCreateAnchor handlers will use the newly added anchor.
     */
    public addAnchor(event: SlideMouseEvent): CurveMutableSerialized {
        const anchorCount = this.graphic.anchors.length;
        const { baseEvent, slide } = event.detail;
        const position = resolvePosition(baseEvent, slide);

        const newAnchors = [];
        newAnchors[anchorCount] = { inHandle: V.from(position), point: V.from(position), outHandle: V.from(position) };

        return { anchors: [...newAnchors] };
    }

    /**
     * Initialize this maker to begin tracking movement for the purpose of creating an anchor.
     * This returns a handler to be called on each subsequent mouse event (unless the initDraw handler is called).
     */
    public initCreateAnchor(): (event: SlideMouseEvent) => CurveMutableSerialized {
        if (!this.isDrawing) {
            return () => ({});
        }

        this.isCreatingAnchor = true;

        if (this.helpers) {
            this.updateHelpers();
            this.helpers.anchor.render();
        }

        const { anchors } = this.graphic;
        const anchorCount = anchors.length;
        const anchorPoint = anchors[anchorCount - 1].point;

        return event => {
            const { baseEvent, slide } = event.detail;
            const position = resolvePosition(baseEvent, slide);

            const newAnchors = [];
            newAnchors[anchorCount - 1] = { inHandle: position.reflect(anchorPoint), outHandle: position };

            return { anchors: [...newAnchors] };
        };
    }

    /**
     * Conclude tracking of movement for the purpose of creating an anchor.
     */
    public endCreateAnchor(): void {
        if (!this.isCreatingAnchor) {
            return;
        }

        this.isCreatingAnchor = false;
        if (this.helpers) {
            this.helpers.anchor.unrender();
        }
    }
}

export default CurveCreator;
