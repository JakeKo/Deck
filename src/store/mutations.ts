import { EditorTool } from "../tools/types";
import { provideId } from "../utilities/IdProvider";
import SlideStateManager from "../utilities/SlideStateManager";
import { AppMutations, AppState, GraphicStoreModel, MUTATIONS } from "./types";
import { getSlide } from "./utilities";
import Vue from 'vue';

const mutations: AppMutations = {
    [MUTATIONS.ADD_SLIDE]: (state: AppState, index: number): void => {
        const slideId = provideId();
        state.slides.splice(index, 9, {
            id: slideId,
            isActive: false,
            graphics: {},
            stateManager: new SlideStateManager(slideId)
        });
    },
    [MUTATIONS.ACTIVE_SLIDE_ID]: (state: AppState, slideId: string): void => {
        const oldActiveSlide = getSlide(state, state.activeSlideId);
        if (oldActiveSlide !== undefined) {
            Vue.set(oldActiveSlide, 'isActive', false);
        }

        state.activeSlideId = slideId;

        const newActiveSlide = getSlide(state, state.activeSlideId);
        if (newActiveSlide !== undefined) {
            Vue.set(newActiveSlide, 'isActive', true);
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
    [MUTATIONS.SET_GRAPHIC]: (state: AppState, { slideId, graphic }: { slideId: string, graphic: GraphicStoreModel }): void => {
        const slide = getSlide(state, slideId);
        if (slide !== undefined) {
            Vue.set(slide.graphics, graphic.id, graphic);
        }
    },
    [MUTATIONS.REMOVE_GRAPHIC]: (state: AppState, { slideId, graphicId }: { slideId: string, graphicId: string }): void => {
        const slide = getSlide(state, slideId);
        if (slide !== undefined) {
            Vue.delete(slide.graphics, graphicId);
        }
    },
    [MUTATIONS.BROADCAST_SET_GRAPHIC]: (state: AppState, { slideId, graphic }: { slideId: string, graphic: GraphicStoreModel }): void => {
        const slide = getSlide(state, slideId);
        if (slide !== undefined) {
            slide.stateManager.setGraphicFromStore(graphic);
        }
    },
    [MUTATIONS.BROADCAST_REMOVE_GRAPHIC]: (state: AppState, { slideId, graphicId }: { slideId: string, graphicId: string }): void => {
        const slide = getSlide(state, slideId);
        if (slide !== undefined) {
            slide.stateManager.removeGraphicFromStore(graphicId);
        }
    }
};

export default mutations;
