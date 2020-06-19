import { GetterTree, MutationTree, ActionTree, Store } from "vuex";
import { EditorTool } from "../tools/types";

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

// TODO: Find out what the second type param should be
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
};

export type RoadmapSlide = {
    id: string;
};

export enum GETTERS {
    SLIDES = 'slides',
    ROADMAP_SLIDES = 'roadmapSlides',
    LAST_SLIDE = 'lastSlide',
    SLIDE = 'slide',
    ACTIVE_SLIDE = 'activeSlide',
    ACTIVE_TOOL_NAME = 'activeToolName',
    RAW_VIEWBOX = 'rawEditorViewbox',
    CROPPED_VIEWBOX = 'croppedEditorViewbox',
    EDITOR_ZOOM_LEVEL = 'editorZoomLevel',
    DECK_TITLE = 'deckTitle'
}

export enum MUTATIONS {
    ADD_SLIDE = 'addSlide',
    ACTIVE_SLIDE_ID = 'activeSlideId',
    ACTIVE_TOOL = 'setActiveTool',
    EDITOR_ZOOM_LEVEL = 'editorZoomLevel',
    DECK_TITLE = 'deckTitle'
}

export enum ACTIONS { }
