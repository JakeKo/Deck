import { EditorTool } from "../tools/types";
import { provideId } from "../utilities/IdProvider";
import { AppMutations, AppState, MUTATIONS, RectangleStoreModel } from "./types";
import { getSlide, getGraphicIndex } from "./utilities";

const mutations: AppMutations = {
    [MUTATIONS.ADD_SLIDE]: (state: AppState, index: number): void => {
        state.slides = [
            ...state.slides.slice(0, index),
            {
                id: provideId(),
                isActive: false,
                graphics: []
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
    },
    [MUTATIONS.ADD_RECTANGLE]: (state: AppState, { slideId, rectangle }: { slideId: string, rectangle: RectangleStoreModel }): void => {
        const slide = getSlide(state, slideId);
        if (slide !== undefined) {
            slide.graphics = [...slide.graphics, rectangle];
        }
    },
    [MUTATIONS.UPDATE_RECTANGLE]: (state: AppState, { slideId, rectangle }: { slideId: string, rectangle: RectangleStoreModel }): void => {
        const slide = getSlide(state, slideId);
        const index = getGraphicIndex(state, slideId, rectangle.id);
        if (slide !== undefined && index !== undefined) {
            slide.graphics[index] = rectangle;
        }
    },
    [MUTATIONS.REMOVE_GRAPHIC]: (state: AppState, { slideId, graphicId }: { slideId: string, graphicId: string }): void => {
        const slide = getSlide(state, slideId);
        const index = getGraphicIndex(state, slideId, graphicId);
        if (slide !== undefined && index !== undefined) {
            slide.graphics = [...slide.graphics.slice(0, index - 1), ...slide.graphics.slice(index)];
        }
    }
};

export default mutations;
