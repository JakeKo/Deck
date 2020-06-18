import { AppState, Viewbox, AppGetters } from "./types";

const getters: AppGetters = {
    slides: (state: AppState): any[] => {
        return state.slides;
    },
    roadmapSlides: (state: AppState): any[] => {
        return state.slides.map(() => ({ key: Math.random() }));
    },
    lastSlide: (state: AppState): any => {
        return state.slides[state.slides.length - 1];
    },
    slide: (state: AppState): (slideId: string) => any => {
        return slideId => {
            const slide = state.slides.find(s => s.id === slideId);

            if (slide === undefined) {
                throw new Error(`Could not find slide (${slideId})`);
            }

            return slide;
        };
    },
    // TODO: Figure out what is the type of getters
    activeSlide: (state: AppState, getters: any): any => {
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
    }
};

export default getters;
