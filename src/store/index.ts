import { themes } from '@/styling';
import { THEMES } from '@/styling/types';
import NullTool from '@/tools/NullTool';
import { provideId } from '@/utilities/IdProvider';
import SlideStateManager from '@/utilities/SlideStateManager';
import { inject, reactive } from 'vue';
import { AppMutations, AppState, AppStore } from './types';
import { getSlide } from './utilities';

function createStore(): AppStore {
    const state = reactive<AppState>({
        activeSlide: undefined,
        slides: [],
        activeTool: NullTool,
        deckTitle: undefined,
        theme: themes[THEMES.LIGHT],
        showPresentation: false,
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
        moveSlide: (sourceIndex, targetIndex) => {
            const [sourceSlide] = state.slides.splice(sourceIndex, 1);
            state.slides.splice(targetIndex, 0, sourceSlide);
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
            if (slide === undefined) {
                return;
            }

            slide.graphics[graphic.id] = graphic;
            if (slide.focusedGraphics[graphic.id]) {
                slide.focusedGraphics[graphic.id] = graphic;
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
        broadcastSetX: (slideId, graphicId, x) => {
            const slide = getSlide(state, slideId);
            slide && slide.stateManager.setXFromStore(graphicId, x);
        },
        broadcastSetY: (slideId, graphicId, y) => {
            const slide = getSlide(state, slideId);
            slide && slide.stateManager.setYFromStore(graphicId, y);
        },
        broadcastSetFillColor: (slideId, graphicId, fillColor) => {
            const slide = getSlide(state, slideId);
            slide && slide.stateManager.setFillColorFromStore(graphicId, fillColor);
        },
        broadcastSetStrokeColor: (slideId, graphicId, strokeColor) => {
            const slide = getSlide(state, slideId);
            slide && slide.stateManager.setStrokeColorFromStore(graphicId, strokeColor);
        },
        broadcastSetStrokeWidth: (slideId, graphicId, strokeWidth) => {
            const slide = getSlide(state, slideId);
            slide && slide.stateManager.setStrokeWidthFromStore(graphicId, strokeWidth);
        },
        broadcastSetWidth: (slideId, graphicId, width) => {
            const slide = getSlide(state, slideId);
            slide && slide.stateManager.setWidthFromStore(graphicId, width);
        },
        broadcastSetHeight: (slideId, graphicId, height) => {
            const slide = getSlide(state, slideId);
            slide && slide.stateManager.setHeightFromStore(graphicId, height);
        },
        broadcastSetRotation: (slideId, graphicId, rotation) => {
            const slide = getSlide(state, slideId);
            slide && slide.stateManager.setRotationFromStore(graphicId, rotation);
        },
        broadcastSetText: (slideId, graphicId, text) => {
            const slide = getSlide(state, slideId);
            slide && slide.stateManager.setTextFromStore(graphicId, text);
        },
        broadcastRemoveGraphic: (slideId, graphicId) => {
            const slide = getSlide(state, slideId);
            if (slide !== undefined) {
                slide.stateManager.removeGraphicFromStore(graphicId);
            }
        },
        setTheme: theme => {
            state.theme = theme;
        },
        setShowPresentation: showPresentation => {
            state.showPresentation = showPresentation;
        }
    };

    return {
        state,
        mutations
    };
}

function useStore(): AppStore {
    const store = inject<AppStore>('store');
    if (store === undefined) {
        throw new Error('Failed to load store');
    }

    return store;
}

export { useStore, createStore };
