import { GetterTree, MutationTree, ActionTree } from "vuex";

export type AppState = {
    activeSlideId: string;
    slides: any[];
    activeToolName: keyof EditorTools;
    tools: EditorTools;
    editorViewbox: {
        zoom: number;
        raw: Viewbox;
        cropped: Viewbox;
    };
};

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

export type EditorTools = {
    pointer: any;
    rectangle: any;
    curve: any;
};
