import SlideModel from './models/Slide';
import Vector from './models/Vector';
import SnapVector from './models/SnapVector';
import * as SVG from 'svg.js';
import { Store } from 'vuex';
import Anchor from './models/graphics/Anchor';

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
    slides: Array<SlideModel>;
    currentTool: string;
    tools: { [key: string]: ICanvasTool };
    deckTitle: string | undefined;
}

export type GraphicEditorObject = {
    metadata: any,
    data: Field[]
}

export type BezierAnchorGraphics = {
    anchor: Anchor,
    firstHandle: Anchor,
    firstHandleTrace: IGraphic,
    secondHandle?: Anchor,
    secondHandleTrace?: IGraphic
};

export interface IGraphic {
    id: string;
    type: string;
    role: string;
    origin: Vector;
    rotation: number;
    anchorIds: Array<string>;
    render(canvas: SVG.Doc): SVG.Element;
    updateRendering(svg: SVG.Element): void;
    getSnapVectors(): Array<SnapVector>;
    getSnappableVectors(): Array<Vector>;
    getAnchors(slideWrapper: ISlideWrapper): Array<Anchor>;
    toGraphicEditorObject(): GraphicEditorObject;
}

export interface ISlideWrapper {
    store: Store<IRootState>;
    slideId: string;
    renderSupplementary: boolean;
    focusGraphic(graphic: IGraphic | undefined): void;
    setCursor(cursor: string): void;
    absoluteBounds(): DOMRect;
    getGraphic(graphicId: string): SVG.Element;
    addGraphic(graphic: IGraphic): void;
    updateGraphic(id: string, newGraphic: IGraphic): void;
    removeGraphic(id: string): void;
    getPosition(event: CustomMouseEvent): Vector;
    addCanvasEventListener(eventName: string, listener: (event: CustomEvent) => void): void;
    removeCanvasEventListener(eventName: string, listener: (event: CustomEvent) => void): void;
    addGraphicEventListener(graphicId: string, eventName: string, listener: (event: CustomEvent) => void): void;
    removeGraphicEventListener(graphicId: string, eventName: string, listener: (event: CustomEvent) => void): void;
    dispatchEventOnCanvas<T>(eventName: string, payload: T): void;
    dispatchEventOnGraphic<T>(graphicId: string, eventName: string, payload: T): void;
}

export type CanvasMouseEvent = {
    baseEvent: MouseEvent,
    slideId: string
}

export type CanvasKeyboardEvent = {
    baseEvent: KeyboardEvent,
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

export type CustomCanvasKeyboardEvent = CustomEvent<CanvasKeyboardEvent>

export type CustomGraphicMouseEvent = CustomEvent<GraphicMouseEvent>

export type CustomMouseEvent = CustomEvent<CanvasMouseEvent | GraphicMouseEvent>

export type Snap = {
    source: Vector,
    destination: SnapVector
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
    role?: string,
    origin?: Vector,
    points?: Array<Vector>,
    fillColor?: string,
    strokeColor?: string,
    strokeWidth?: number,
    rotation?: number
}

export type EllipseParameters = {
    id?: string,
    role?: string,
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
    role?: string,
    origin?: Vector,
    source?: string,
    width?: number,
    height?: number,
    rotation?: number
}

export type RectangleParameters = {
    id?: string,
    role?: string,
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
    role?: string,
    origin?: Vector,
    points?: Array<Vector>,
    fillColor?: string,
    strokeColor?: string,
    strokeWidth?: number,
    rotation?: number
}

export type TextParameters = {
    id?: string,
    role?: string,
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
    role?: string,
    origin?: Vector,
    source?: string,
    width?: number,
    height?: number,
    rotation?: number
}

export type SlideModelParameters = {
    id?: string,
    graphics?: Array<IGraphic>,
    snapVectors?: Array<SnapVector>,
    slideWrapper?: ISlideWrapper,
    isRendered?: boolean,
    topic?: string,
    width: number,
    height: number
}

export interface ICanvasTool {
    canvasMouseOver: (slideWrapper: ISlideWrapper) => (event: CustomCanvasMouseEvent) => void;
    canvasMouseOut: (slideWrapper: ISlideWrapper) => (event: CustomCanvasMouseEvent) => void;
    canvasMouseUp: (slideWrapper: ISlideWrapper) => (event: CustomCanvasMouseEvent) => void;
    canvasMouseDown: (slideWrapper: ISlideWrapper) => (event: CustomCanvasMouseEvent) => void;
    canvasMouseMove: (slideWrapper: ISlideWrapper) => (event: CustomCanvasMouseEvent) => void;
    graphicMouseOver: (slideWrapper: ISlideWrapper) => (event: CustomGraphicMouseEvent) => void;
    graphicMouseOut: (slideWrapper: ISlideWrapper) => (event: CustomGraphicMouseEvent) => void;
    graphicMouseUp: (slideWrapper: ISlideWrapper) => (event: CustomGraphicMouseEvent) => void;
    graphicMouseDown: (slideWrapper: ISlideWrapper) => (event: CustomGraphicMouseEvent) => void;
    graphicMouseMove: (slideWrapper: ISlideWrapper) => (event: CustomGraphicMouseEvent) => void;
}

export type Field = TextField | NumberField | ColorField;

export type TextField = {
    displayName: string,
    inputType: 'text',
    maxLength?: number,
    minLength?: number,
    value: string
};

export type NumberField = {
    displayName: string,
    inputType: 'number',
    max?: number,
    min?: number,
    step?: number,
    value: number
};

export type ColorField = {
    displayName: string,
    inputType: 'color',
    value: string
};
