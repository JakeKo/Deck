import Slide from "./models/Slide";
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
    graphicEditorGraphicId: string | undefined;
    slides: Array<Slide>;
    currentTool: string;
    tools: { [key: string]: ICanvasTool };
    deckTitle: string | undefined;
}

export interface ICanvasTool {
    canvasMouseDown(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void;
    canvasMouseOver(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void;
    canvasMouseOut(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void;
    graphicMouseOver(slideWrapper: ISlideWrapper): (event: CustomGraphicMouseEvent) => void;
    graphicMouseOut(slideWrapper: ISlideWrapper): (event: CustomGraphicMouseEvent) => void;
    graphicMouseDown(slideWrapper: ISlideWrapper): (event: CustomGraphicMouseEvent) => void;
}

// TODO: Rename this to GraphicEditorObject
export type GraphicEditorFormat = {
    metadata: any,
    data: any
}

export type BezierAnchorGraphics = {
    anchor: IGraphic,
    firstHandle: IGraphic,
    firstHandleTrace: IGraphic,
    secondHandle?: IGraphic,
    secondHandleTrace?: IGraphic
};

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
    toGraphicEditorFormat(): GraphicEditorFormat;
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

export type CanvasMouseEvent = {
    baseEvent: MouseEvent,
    slideId: string
}

export type GraphicMouseEvent = {
    baseEvent: MouseEvent,
    slideId: string,
    graphicId: string
}

export type GraphicEvent = {
    slideId: string,
    graphicId?: string,
    graphic?: IGraphic
}

export type CustomCanvasMouseEvent = CustomEvent<CanvasMouseEvent>

export type CustomGraphicMouseEvent = CustomEvent<GraphicMouseEvent>

export type CustomMouseEvent = CustomEvent<CanvasMouseEvent | GraphicMouseEvent>

export type Snap = {
    source: Vector,
    destination: SnapVector
}

export type Anchor = {
    graphic: IGraphic,
    cursor: string,
    handler: (event: CustomMouseEvent) => void
}

export type SlideExportObject = {
    id: string,
    graphics: Array<IGraphic>,
    topic: string,
    width: number,
    height: number
}

export type CurveParameters = {
    id?: string,
    defaultInteractive?: boolean,
    supplementary?: boolean,
    origin?: Vector,
    points?: Array<Vector>,
    fillColor?: string,
    strokeColor?: string,
    strokeWidth?: number,
    rotation?: number
}

export type EllipseParameters = {
    id?: string,
    defaultInteractive?: boolean,
    supplementary?: boolean,
    origin?: Vector,
    width?: number,
    height?: number,
    fillColor?: string,
    strokeColor?: string,
    strokeWidth?: number,
    rotation?: number
}

export type ImageParameters = {
    id?: string,
    defaultInteractive?: boolean,
    supplementary?: boolean,
    origin?: Vector,
    source?: string,
    width?: number,
    height?: number,
    rotation?: number
}

export type RectangleParameters = {
    id?: string,
    defaultInteractive?: boolean,
    supplementary?: boolean,
    origin?: Vector,
    width?: number,
    height?: number,
    fillColor?: string,
    strokeColor?: string,
    strokeWidth?: number,
    rotation?: number
}

export type SketchParameters = {
    id?: string,
    defaultInteractive?: boolean,
    supplementary?: boolean,
    origin?: Vector,
    points?: Array<Vector>,
    fillColor?: string,
    strokeColor?: string,
    strokeWidth?: number,
    rotation?: number
}

export type TextParameters = {
    id?: string,
    defaultInteractive?: boolean,
    supplementary?: boolean,
    origin?: Vector,
    content?: string,
    fontSize?: number,
    fontWeight?: string,
    fontFamily?: string,
    fillColor?: string,
    rotation?: number
}

export type VideoParameters = {
    id?: string,
    defaultInteractive?: boolean,
    supplementary?: boolean,
    origin?: Vector,
    source?: string,
    width?: number,
    height?: number,
    rotation?: number
}

export type SlideParameters = {
    id?: string,
    graphics?: Array<IGraphic>,
    snapVectors?: Array<SnapVector>,
    topic?: string,
    width: number,
    height: number
}
