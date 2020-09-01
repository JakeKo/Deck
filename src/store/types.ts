import { GRAPHIC_TYPES } from '@/rendering/types';
import { BaseStyles, Theme } from '@/styling/types';
import { EditorTool, TOOL_NAMES } from '@/tools/types';
import SlideStateManager from '@/utilities/SlideStateManager';
import Vector from '@/utilities/Vector';
import { ComputedRef } from 'vue';

export type AppState = {
    activeSlideId: string;
    slides: Slide[];
    activeTool: EditorTool;
    deckTitle: string | undefined;
    theme: Theme;
    editorViewbox: {
        zoom: number;
        raw: Viewbox;
        cropped: Viewbox;
    };
};

export type AppStore = ComputedType<AppGetters> & AppMutations;

export type AppGetters = {
    slides: Slide[];
    roadmapSlides: RoadmapSlide[];
    lastSlide: Slide | undefined;
    activeSlide: Slide | undefined;
    activeToolName: TOOL_NAMES;
    rawViewbox: Viewbox;
    croppedViewbox: Viewbox;
    editorZoomLevel: number;
    deckTitle: string | undefined;
    style: { theme: Theme; baseStyle: BaseStyles };
};

export type AppMutations = {
    addSlide: (index: number, slide?: Slide) => void;
    removeAllSlides: () => void;
    setActiveSlide: (slideId: string) => void;
    setActiveTool: (tool: EditorTool) => void;
    setEditorZoom: (zoom: number) => void;
    setDeckTitle: (deckTitle: string) => void;
    setGraphic: (slideId: string, graphic: GraphicStoreModel) => void;
    removeGraphic: (slideId: string, graphicId: string) => void;
    broadcastSetGraphic: (slideId: string, graphic: GraphicStoreModel) => void;
    broadcastRemoveGraphic: (slideId: string, graphicId: string) => void;
    setTheme: (theme: Theme) => void;
};

export type ComputedType<T> = { [K in keyof T]: ComputedRef<T[K]> };

export type Viewbox = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type Slide = {
    id: string;
    isActive: boolean;
    graphics: { [index: string]: GraphicStoreModel };
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
    points: Vector[];
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    rotation: number;
};

export type EllipseStoreModel = {
    id: string;
    type: GRAPHIC_TYPES.ELLIPSE;
    center: Vector;
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
    origin: Vector;
    width: number;
    height: number;
    strokeColor: string;
    strokeWidth: number;
    rotation: number;
};

export type RectangleStoreModel = {
    id: string;
    type: GRAPHIC_TYPES.RECTANGLE;
    origin: Vector;
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
    origin: Vector;
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
    origin: Vector;
    width: number;
    height: number;
    strokeColor: string;
    strokeWidth: number;
    rotation: number;
};
