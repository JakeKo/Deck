import { themes } from '@/styling';
import { THEMES } from '@/styling/types';
import NullTool from '@/tools/NullTool';
import { provideId } from '@/utilities/IdProvider';
import SlideStateManager from '@/utilities/SlideStateManager';
import { inject, provide, reactive } from 'vue';
import { AppMutations, AppState, AppStore } from './types';
import { getSlide } from './utilities';

function createStore(): AppStore {
    const state = reactive<AppState>({
        activeSlide: undefined,
        slides: [],
        activeTool: NullTool,
        deckTitle: undefined,
        theme: themes[THEMES.LIGHT],
        editorViewbox: {
            zoom: 1,
            raw: {
                x: -1920,
                y: -1080,
                width: 5760,
                height: 3240
            },
            cropped: {
                x: 0,
                y: 0,
                width: 1920,
                height: 1080
            }
        }
    }) as AppState;

    const mutations: AppMutations = {
        addSlide: (index, slide) => {
            const slideId = provideId();
            state.slides = [
                ...state.slides.slice(0, index),
                slide ?? {
                    id: slideId,
                    isActive: false,
                    graphics: {},
                    focusedGraphics: {},
                    stateManager: new SlideStateManager(slideId)
                },
                ...state.slides.slice(index)
            ];
        },
        removeSlide: index => {
            state.slides.splice(index, 1);
        },
        removeAllSlides: () => {
            if (state.activeSlide !== undefined) {
                state.activeSlide.isActive = false;
                state.activeSlide = undefined;
            }

            state.slides = [];
        },
        setActiveSlide: slideId => {
            if (state.activeSlide !== undefined) {
                state.activeSlide.isActive = false;
            }

            state.activeSlide = getSlide(state, slideId);

            if (state.activeSlide !== undefined) {
                state.activeSlide.isActive = true;
            }
        },
        focusGraphic: (slideId, graphicId) => {
            const slide = getSlide(state, slideId);
            if (slide !== undefined && !slide.focusedGraphics[graphicId] && slide.graphics[graphicId]) {
                slide.focusedGraphics[graphicId] = slide.graphics[graphicId];
            }
        },
        focusGraphicBulk: (slideId, graphicIds) => {
            const slide = getSlide(state, slideId);
            if (slide !== undefined) {
                graphicIds.forEach(graphicId => {
                    if (!slide.focusedGraphics[graphicId] && slide.graphics[graphicId]) {
                        slide.focusedGraphics[graphicId] = slide.graphics[graphicId];
                    }
                });
            }
        },
        unfocusGraphic: (slideId, graphicId) => {
            const slide = getSlide(state, slideId);
            if (slide !== undefined && slide.focusedGraphics[graphicId]) {
                delete slide.focusedGraphics[graphicId];
            }
        },
        unfocusGraphicBulk: (slideId, graphicIds) => {
            const slide = getSlide(state, slideId);
            if (slide !== undefined) {
                graphicIds.forEach(graphicId => {
                    if (slide.focusedGraphics[graphicId]) {
                        delete slide.focusedGraphics[graphicId];
                    }
                });
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
        removeGraphic: (slideId, graphicId) => {
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
    };

    return {
        state,
        mutations
    };
}

const storeSymbol = Symbol('store');

function provideStore(): void {
    provide(storeSymbol, createStore());
}

function useStore(): AppStore {
    const store = inject<AppStore>(storeSymbol);
    if (store === undefined) {
        throw new Error('Failed to load store');
    }

    return store;
}

export { provideStore, useStore };
