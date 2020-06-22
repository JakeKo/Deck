import { AppState, Viewbox, AppGetters, Slide, RoadmapSlide, GETTERS } from "./types";
import { TOOL_NAMES } from "../tools/types";
import { getSlide } from "./utilities";

const getters: AppGetters = {
    [GETTERS.SLIDES]: (state: AppState): Slide[] => {
        return state.slides;
    },
    [GETTERS.ROADMAP_SLIDES]: (state: AppState): RoadmapSlide[] => {
        return state.slides.map<RoadmapSlide>(s => s);
    },
    [GETTERS.LAST_SLIDE]: (state: AppState): Slide => {
        return state.slides[state.slides.length - 1];
    },
    [GETTERS.ACTIVE_SLIDE]: (state: AppState): Slide | undefined => {
        return getSlide(state, state.activeSlideId);
    },
    [GETTERS.ACTIVE_TOOL_NAME]: (state: AppState): TOOL_NAMES => {
        return state.activeTool.name;
    },
    [GETTERS.RAW_VIEWBOX]: (state: AppState): Viewbox => {
        return state.editorViewbox.raw;
    },
    [GETTERS.CROPPED_VIEWBOX]: (state: AppState): Viewbox => {
        return state.editorViewbox.cropped;
    },
    [GETTERS.EDITOR_ZOOM_LEVEL]: (state: AppState): number => {
        return state.editorViewbox.zoom;
    },
    [GETTERS.DECK_TITLE]: (state: AppState): string | undefined => {
        return state.deckTitle;
    }
};

export default getters;
