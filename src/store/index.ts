import { getBaseStyles, themes } from '@/styling';
import { THEMES } from '@/styling/types';
import NullTool from '@/tools/NullTool';
import { provideId } from '@/utilities/IdProvider';
import SlideStateManager from '@/utilities/SlideStateManager';
import { computed, inject, provide, reactive } from 'vue';
import { AppGetters, AppMutations, AppState, AppStore, ComputedType, RoadmapSlide } from './types';
import { getSlide } from './utilities';

const storeSymbol = Symbol('store');

function createStore(): AppStore {
    const state = reactive<AppState>({
        activeSlideId: '',
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

    const getters: ComputedType<AppGetters> = {
        slides: computed(() => state.slides),
        roadmapSlides: computed(() => state.slides.map<RoadmapSlide>(s => s)),
        lastSlide: computed(() => state.slides[state.slides.length - 1]),
        activeSlide: computed(() => getSlide(state, state.activeSlideId)),
        activeToolName: computed(() => state.activeTool.name),
        rawViewbox: computed(() => state.editorViewbox.raw),
        croppedViewbox: computed(() => state.editorViewbox.cropped),
        editorZoomLevel: computed(() => state.editorViewbox.zoom),
        deckTitle: computed(() => state.deckTitle),
        style: computed(() => ({
            theme: state.theme,
            baseStyle: getBaseStyles(state.theme)
        }))
    };

    const mutations: AppMutations = {
        addSlide: (index, slide) => {
            const slideId = provideId();
            state.slides.splice(index, 0, slide ?? {
                id: slideId,
                isActive: false,
                graphics: {},
                focusedGraphics: {},
                stateManager: new SlideStateManager(slideId)
            });
        },
        removeSlide: index => {
            state.slides.splice(index, 1);
        },
        removeAllSlides: () => {
            const activeSlide = getSlide(state, state.activeSlideId);
            if (activeSlide !== undefined) {
                activeSlide.isActive = false;
                state.activeSlideId = '';
            }

            state.slides.splice(0, state.slides.length);
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
        ...getters,
        ...mutations
    };
}

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
