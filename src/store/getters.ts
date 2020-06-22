import { AppState, Viewbox, AppGetters, Slide, RoadmapSlide, GETTERS } from "./types";

const getters: AppGetters = {
    [GETTERS.SLIDES]: (state: AppState): Slide[] => {
        return state.slides;
    },
    [GETTERS.ROADMAP_SLIDES]: (state: AppState): RoadmapSlide[] => {
        return state.slides.map<RoadmapSlide>(s => ({ id: s.id }));
    },
    [GETTERS.LAST_SLIDE]: (state: AppState): Slide => {
        return state.slides[state.slides.length - 1];
    },
    [GETTERS.SLIDE]: (state: AppState): (slideId: string) => Slide => {
        return slideId => {
            const slide = state.slides.find(s => s.id === slideId);

            if (slide === undefined) {
                throw new Error(`Could not find slide (${slideId})`);
            }

            return slide;
        };
    },
    // TODO: Figure out what is the type of getters
    [GETTERS.ACTIVE_SLIDE]: (state: AppState, getters: any): Slide => {
        return state.activeSlideId === '' ? undefined : getters[GETTERS.SLIDE](state.activeSlideId);
    },
    [GETTERS.ACTIVE_TOOL_NAME]: (state: AppState): string => {
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
