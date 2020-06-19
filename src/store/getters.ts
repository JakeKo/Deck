import { AppState, Viewbox, AppGetters, Slide, RoadmapSlide } from "./types";

const getters: AppGetters = {
    slides: (state: AppState): Slide[] => {
        return state.slides;
    },
    roadmapSlides: (state: AppState): RoadmapSlide[] => {
        return state.slides.map<RoadmapSlide>(s => ({ id: s.id }));
    },
    lastSlide: (state: AppState): Slide => {
        return state.slides[state.slides.length - 1];
    },
    slide: (state: AppState): (slideId: string) => Slide => {
        return slideId => {
            const slide = state.slides.find(s => s.id === slideId);

            if (slide === undefined) {
                throw new Error(`Could not find slide (${slideId})`);
            }

            return slide;
        };
    },
    // TODO: Figure out what is the type of getters
    activeSlide: (state: AppState, getters: any): Slide => {
        return state.activeSlideId === '' ? undefined : getters.slide(state.activeSlideId);
    },
    activeToolName: (state: AppState): string => {
        return state.activeTool.name;
    },
    rawEditorViewbox: (state: AppState): Viewbox => {
        return state.editorViewbox.raw;
    },
    croppedEditorViewbox: (state: AppState): Viewbox => {
        return state.editorViewbox.cropped;
    },
    editorZoomLevel: (state: AppState): number => {
        return state.editorViewbox.zoom;
    },
    deckTitle: (state: AppState): string | undefined => {
        return state.deckTitle;
    }
};

export default getters;
