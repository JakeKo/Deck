import { provideId } from '@/utilities/IdProvider';
import SlideStateManager from '@/utilities/SlideStateManager';
import { AppMutations, AppState } from './types';
import { getSlide } from './utilities';

const mutations: (state: AppState) => AppMutations = state => ({
    addSlide: index => {
        const slideId = provideId();
        state.slides.splice(index, 0, {
            id: slideId,
            isActive: false,
            graphics: {},
            stateManager: new SlideStateManager(slideId)
        });
    },
    setActiveSlide: slideId => {
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
    setActiveTool: tool => {
        state.activeTool.unmount();
        state.activeTool = tool;
        state.activeTool.mount();
    },
    setEditorZoom: zoom => {
        state.editorViewbox.zoom = zoom;
    },
    setDeckTitle: deckTitle => {
        state.deckTitle = deckTitle === '' ? undefined : deckTitle;
    },
    setGraphic: (slideId, graphic) => {
        const slide = getSlide(state, slideId);
        if (slide !== undefined) {
            slide.graphics[graphic.id] = graphic;
        }
    },
    removeGraphic: (slideId, graphicId) {
        const slide = getSlide(state, slideId);
        if (slide !== undefined) {
            delete slide.graphics[graphicId];
        }
    },
    broadcastSetGraphic: (slideId, graphic) => {
        const slide = getSlide(state, slideId);
        if (slide !== undefined) {
            slide.stateManager.setGraphicFromStore(graphic);
        }
    },
    broadcastRemoveGraphic: (slideId, graphicId) => {
        const slide = getSlide(state, slideId);
        if (slide !== undefined) {
            slide.stateManager.removeGraphicFromStore(graphicId);
        }
    },
    setTheme: theme => {
        state.theme = theme;
    }
});

export default mutations;
