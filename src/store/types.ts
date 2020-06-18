import { GetterTree, MutationTree, ActionTree, Store } from "vuex";
import { EditorTool } from "../tools/types";

export type AppState = {
    activeSlideId: string;
    slides: Slide[];
    activeTool: EditorTool;
    editorViewbox: {
        zoom: number;
        raw: Viewbox;
        cropped: Viewbox;
    };
};

export type AppStore = Store<AppState>;

// TODO: Find out what the second type param should be
export type AppGetters = GetterTree<AppState, any>;

export type AppMutations = MutationTree<AppState>;

export type AppActions = ActionTree<AppState, any>;

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
