import { AppMutations, AppState, MUTATIONS } from "./types";
import { EditorTool } from "../tools/types";
import { getSlide } from "./utilities";

const mutations: AppMutations = {
    [MUTATIONS.ADD_SLIDE]: (state: AppState, index: number): void => {
        state.slides = [
            ...state.slides.slice(0, index),
            {
                id: Math.random().toString(),
                isActive: false
            },
            ...state.slides.slice(index)
        ];
    },
    [MUTATIONS.ACTIVE_SLIDE_ID]: (state: AppState, slideId: string): void => {
        const oldActiveSlide = getSlide(state, state.activeSlideId);
        if (oldActiveSlide !== undefined) {
            oldActiveSlide.isActive = false;
        }

        state.activeSlideId = slideId;

        const newActiveSlide = getSlide(state, state.activeSlideId);
        if (newActiveSlide !== undefined) {
            newActiveSlide.isActive = true;
        }
    },
    [MUTATIONS.ACTIVE_TOOL]: (state: AppState, tool: EditorTool): void => {
        state.activeTool.unmount();
        state.activeTool = tool;
        state.activeTool.mount();
    },
    [MUTATIONS.EDITOR_ZOOM_LEVEL]: (state: AppState, zoomLevel: number): void => {
        state.editorViewbox.zoom = zoomLevel;
    },
    [MUTATIONS.DECK_TITLE]: (state: AppState, deckTitle: string): void => {
        state.deckTitle = deckTitle === '' ? undefined : deckTitle;
    }
};

export default mutations;
