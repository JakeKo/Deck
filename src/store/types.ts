import { GRAPHIC_TYPES } from '@/rendering/types';
import { Theme } from '@/styling/types';
import { EditorTool } from '@/tools/types';
import { GraphicMutableSerialized, GraphicSerialized, Keyed } from '@/types';

export type AppState = {
    eventPublisherId: 'store';
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
    createGraphic: (slideId: string, props: GraphicSerialized, emit?: boolean) => void;
    focusGraphic: (slideId: string, graphicId: string, emit?: boolean) => void;
    unfocusGraphic: (slideId: string, graphicId: string, emit?: boolean) => void;
    setActiveTool: (tool: EditorTool) => void;
    setEditorZoom: (zoom: number) => void;
    setDeckTitle: (deckTitle: string) => void;
    setProps: (slideId: string, graphicId: string, graphicType: GRAPHIC_TYPES, props: GraphicMutableSerialized, emit?: boolean) => void;
    removeGraphic: (slideId: string, graphicId: string) => void;
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
    graphics: Keyed<GraphicSerialized>;
    focusedGraphics: Keyed<GraphicSerialized>;
};

export type RoadmapSlide = {
    id: string;
    isActive: boolean;
};
