import { GRAPHIC_TYPES } from '@/rendering/types';
import { Theme } from '@/styling/types';
import { EditorTool } from '@/tools/types';
import SlideStateManager from '@/utilities/SlideStateManager';
import V from '@/utilities/Vector';

export type AppState = {
    activeSlide: Slide | undefined;
    slides: Slide[];
    activeTool: EditorTool;
    deckTitle: string | undefined;
    theme: Theme;
    showPresentation: boolean;
    editorViewbox: {
        zoom: number;
        raw: Viewbox;
        cropped: Viewbox;
    };
};

export type AppStore = {
    state: AppState;
    mutations: AppMutations;
};

export type AppMutations = {
    addSlide: (index: number, slide?: Slide) => void;
    removeSlide: (index: number) => void;
    removeAllSlides: () => void;
    moveSlide: (source: number, target: number) => void;
    setActiveSlide: (slideId: string) => void;
    focusGraphic: (slideId: string, graphicId: string) => void;
    focusGraphicBulk: (slideId: string, graphicIds: string[]) => void;
    unfocusGraphic: (slideId: string, graphicId: string) => void;
    unfocusGraphicBulk: (slideId: string, graphicIds: string[]) => void;
    setActiveTool: (tool: EditorTool) => void;
    setEditorZoom: (zoom: number) => void;
    setDeckTitle: (deckTitle: string) => void;
    setGraphic: (slideId: string, graphic: GraphicStoreModel) => void;
    removeGraphic: (slideId: string, graphicId: string) => void;
    broadcastSetGraphic: (slideId: string, graphic: GraphicStoreModel) => void;
    broadcastSetX: (slideId: string, graphicId: string, x: number) => void;
    broadcastSetY: (slideId: string, graphicId: string, y: number) => void;
    broadcastSetFillColor: (slideId: string, graphicId: string, fillColor: string) => void;
    broadcastSetStrokeColor: (slideId: string, graphicId: string, strokeColor: string) => void;
    broadcastSetStrokeWidth: (slideId: string, graphicId: string, strokeWidth: number) => void;
    broadcastSetWidth: (slideId: string, graphicId: string, width: number) => void;
    broadcastSetHeight: (slideId: string, graphicId: string, height: number) => void;
    broadcastSetRotation: (slideId: string, graphicId: string, rotation: number) => void;
    broadcastRemoveGraphic: (slideId: string, graphicId: string) => void;
    setTheme: (theme: Theme) => void;
    setShowPresentation: (showPresentation: boolean) => void;
};

export type Viewbox = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type Slide = {
    id: string;
    isActive: boolean;
    graphics: { [key: string]: GraphicStoreModel };
    focusedGraphics: { [key: string]: GraphicStoreModel };
    stateManager: SlideStateManager;
};

export type RoadmapSlide = {
    id: string;
    isActive: boolean;
};

export type GraphicStoreModel = CurveStoreModel | EllipseStoreModel | ImageStoreModel | RectangleStoreModel | TextboxStoreModel | VideoStoreModel;

export type CurveStoreModel = {
    id: string;
    type: GRAPHIC_TYPES.CURVE;
    points: V[];
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    rotation: number;
};

export type EllipseStoreModel = {
    id: string;
    type: GRAPHIC_TYPES.ELLIPSE;
    center: V;
    width: number;
    height: number;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    rotation: number;
};

export type ImageStoreModel = {
    id: string;
    type: GRAPHIC_TYPES.IMAGE;
    source: string;
    origin: V;
    width: number;
    height: number;
    rotation: number;
};

export type RectangleStoreModel = {
    id: string;
    type: GRAPHIC_TYPES.RECTANGLE;
    origin: V;
    width: number;
    height: number;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    rotation: number;
};

export type TextboxStoreModel = {
    id: string;
    type: GRAPHIC_TYPES.TEXTBOX;
    text: string;
    origin: V;
    width: number;
    height: number;
    size: number;
    weight: string;
    font: string;
    rotation: number;
};

export type VideoStoreModel = {
    id: string;
    type: GRAPHIC_TYPES.VIDEO;
    source: string;
    origin: V;
    width: number;
    height: number;
    strokeColor: string;
    strokeWidth: number;
    rotation: number;
};
