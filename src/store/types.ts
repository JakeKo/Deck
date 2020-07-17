import { ActionTree, GetterTree, MutationTree, Store } from "vuex";
import { GRAPHIC_TYPES } from "../rendering/types";
import { Theme } from "../styling/types";
import { EditorTool } from "../tools/types";
import SlideStateManager from "../utilities/SlideStateManager";
import Vector from "../utilities/Vector";

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

export type AppStore = Store<AppState>;

export type AppGetters = GetterTree<AppState, AppState>;

export type AppMutations = MutationTree<AppState>;

export type AppActions = ActionTree<AppState, AppState>;

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

export enum GETTERS {
    SLIDES = 'getSlides',
    ROADMAP_SLIDES = 'getRoadmapSlides',
    LAST_SLIDE = 'getLastSlide',
    SLIDE = 'getSlide',
    ACTIVE_SLIDE = 'getActiveSlide',
    ACTIVE_TOOL_NAME = 'getActiveToolName',
    RAW_VIEWBOX = 'getRawViewbox',
    CROPPED_VIEWBOX = 'getCroppedViewbox',
    EDITOR_ZOOM_LEVEL = 'getEditorZoomLevel',
    DECK_TITLE = 'getDeckTitle',
    STYLE = 'style'
}

export enum MUTATIONS {
    ADD_SLIDE = 'addSlide',
    ACTIVE_SLIDE_ID = 'setActiveSlideId',
    ACTIVE_TOOL = 'setActiveTool',
    EDITOR_ZOOM_LEVEL = 'setEditorZoomLevel',
    DECK_TITLE = 'setDeckTitle',
    SET_GRAPHIC = 'setGraphic',
    REMOVE_GRAPHIC = 'removeGraphic',
    BROADCAST_SET_GRAPHIC = 'broadcastSetGraphic',
    BROADCAST_REMOVE_GRAPHIC = 'broadcastRemoveGraphic',
    THEME = 'setTheme'
}

export enum ACTIONS { }

export type GraphicStoreModel = RectangleStoreModel;

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
