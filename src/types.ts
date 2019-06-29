import Slide from "./models/Slide";
import Anchor from "./models/Anchor";
import Vector from "./models/Vector";
import SnapVector from "./models/SnapVector";
import * as SVG from "svg.js";
import { Store } from "vuex";

export interface IRootState {
    activeSlideId: string;
    focusedGraphicId: string | undefined;
    canvas: {
        height: number,
        width: number,
        zoom: number,
        rawViewbox: {
            x: number,
            y: number,
            width: number,
            height: number
        },
        croppedViewbox: {
            x: number,
            y: number,
            width: number,
            height: number
        }
    };
    graphicEditor: {
        object: any
    };
    slides: Array<Slide>;
    currentTool: string;
    tools: { [key: string]: ICanvasTool };
    deckTitle: string;
}

export interface ICanvasTool {
    canvasMouseDown(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void;
    canvasMouseOver(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void;
    canvasMouseOut(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void;
    graphicMouseOver(slideWrapper: ISlideWrapper): (event: CustomGraphicMouseEvent) => void;
    graphicMouseOut(slideWrapper: ISlideWrapper): (event: CustomGraphicMouseEvent) => void;
    graphicMouseDown(slideWrapper: ISlideWrapper): (event: CustomGraphicMouseEvent) => void;
}

export interface IGraphic {
    id: string;
    type: string;
    origin: Vector;
    rotation: number;
    anchorIds: Array<string>;
    defaultInteractive: boolean;
    supplementary: boolean;
    render(canvas: SVG.Doc): SVG.Element;
    updateRendering(svg: SVG.Element): void;
    getSnapVectors(): Array<SnapVector>;
    getSnappableVectors(): Array<Vector>;
    getAnchors(slideWrapper: ISlideWrapper): Array<Anchor>;
}

export interface ISlideWrapper {
    store: Store<IRootState>;
    slideId: string;
    renderSupplementary: boolean;
    focusGraphic(graphic: IGraphic | undefined): void;
    setCursor(cursor: string): void;
    absoluteBounds(): DOMRect;
    getRenderedGraphic(id: string): SVG.Element;
    addGraphic(graphic: IGraphic): void;
    updateGraphic(id: string, newGraphic: IGraphic): void;
    removeGraphic(id: string): void;
    getPosition(event: CustomMouseEvent): Vector;
}

export interface ICanvasMouseEvent {
    baseEvent: MouseEvent;
    slideId: string;
}

export interface IGraphicMouseEvent {
    baseEvent: MouseEvent;
    slideId: string;
    graphicId: string;
}

export type CustomCanvasMouseEvent = CustomEvent<ICanvasMouseEvent>

export type CustomGraphicMouseEvent = CustomEvent<IGraphicMouseEvent>

export type CustomMouseEvent = CustomEvent<ICanvasMouseEvent | IGraphicMouseEvent>
