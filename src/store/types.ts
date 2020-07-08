import { GetterTree, MutationTree, ActionTree, Store } from "vuex";
import { EditorTool } from "../tools/types";
import Vector from "../utilities/Vector";
import { GRAPHIC_TYPES } from "../rendering/types";

export type AppState = {
    activeSlideId: string;
    slides: Slide[];
    activeTool: EditorTool;
    deckTitle: string | undefined;
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

// TODO: Consider implications of array of graphics vs. id-keyed object
export type Slide = {
    id: string;
    isActive: boolean;
    graphics: GraphicStoreModel[];
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
    DECK_TITLE = 'getDeckTitle'
}

export enum MUTATIONS {
    ADD_SLIDE = 'addSlide',
    ACTIVE_SLIDE_ID = 'setActiveSlideId',
    ACTIVE_TOOL = 'setActiveTool',
    EDITOR_ZOOM_LEVEL = 'setEditorZoomLevel',
    DECK_TITLE = 'setDeckTitle',
    ADD_RECTANGLE = 'addRectangle',
    UPDATE_RECTANGLE = 'updateRectangle',
    REMOVE_GRAPHIC = 'removeGraphic'
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
