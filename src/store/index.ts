import { dispatch } from '@/events';
import { GraphicUpdatedPayload, GRAPHIC_EVENT_CODES } from '@/events/types';
import { GRAPHIC_TYPES } from '@/rendering/types';
import { themes } from '@/styling';
import { THEMES } from '@/styling/types';
import NullTool from '@/tools/NullTool';
import {
    CurveMutableSerialized,
    EllipseMutableSerialized,
    GraphicMutableSerialized,
    ImageMutableSerialized,
    RectangleMutableSerialized,
    TextboxMutableSerialized,
    VideoMutableSerialized
} from '@/types';
import { provideId } from '@/utilities/IdProvider';
import SlideStateManager from '@/utilities/SlideStateManager';
import V from '@/utilities/Vector';
import { inject, reactive } from 'vue';
import {
    AppMutations,
    AppState,
    AppStore,
    CurveStoreModel,
    EllipseStoreModel,
    GraphicStoreModel,
    ImageStoreModel,
    RectangleStoreModel,
    TextboxStoreModel,
    VideoStoreModel
} from './types';
import { getSlide } from './utilities';

function setVector(source: { x?: number; y?: number }, target: V): void {
    if (source.x) {
        target.x = source.x;
    }

    if (source.y) {
        target.y = source.y;
    }
}

const propSetters = {
    [GRAPHIC_TYPES.CURVE]: (graphic: CurveStoreModel, props: CurveMutableSerialized): void => {
        if (props.anchors) {
            props.anchors.forEach((anchor, index) => {
                if (anchor) {
                    // The store model for points is a flat array (vs. the curve anchor model)
                    // Calculate the corresponding index of the curve anchor's in-handle
                    const pointsIndex = index * 3;

                    if (anchor.inHandle) {
                        if (!graphic.points[pointsIndex]) {
                            graphic.points[pointsIndex] = V.zero;
                        }

                        setVector(anchor.inHandle, graphic.points[pointsIndex]);
                    }

                    if (anchor.point) {
                        if (!graphic.points[pointsIndex + 1]) {
                            graphic.points[pointsIndex + 1] = V.zero;
                        }

                        setVector(anchor.point, graphic.points[pointsIndex + 1]);
                    }

                    if (anchor.outHandle) {
                        if (!graphic.points[pointsIndex + 2]) {
                            graphic.points[pointsIndex + 2] = V.zero;
                        }

                        setVector(anchor.outHandle, graphic.points[pointsIndex + 2]);
                    }
                }
            });
        }

        if (props.fillColor) {
            graphic.fillColor = props.fillColor;
        }

        if (props.rotation) {
            graphic.rotation = props.rotation;
        }

        if (props.strokeWidth) {
            graphic.strokeWidth = props.strokeWidth;
        }

        if (props.strokeColor) {
            graphic.strokeColor = props.strokeColor;
        }
    },
    [GRAPHIC_TYPES.ELLIPSE]: (graphic: EllipseStoreModel, props: EllipseMutableSerialized): void => {
        if (props.center) {
            setVector(props.center, graphic.center);
        }

        if (props.dimensions) {
            if (props.dimensions.x) {
                graphic.width = props.dimensions.x;
            }

            if (props.dimensions.y) {
                graphic.height = props.dimensions.y;
            }
        }

        if (props.fillColor) {
            graphic.fillColor = props.fillColor;
        }

        if (props.rotation) {
            graphic.rotation = props.rotation;
        }

        if (props.strokeColor) {
            graphic.strokeColor = props.strokeColor;
        }

        if (props.strokeWidth) {
            graphic.strokeWidth = props.strokeWidth;
        }
    },
    [GRAPHIC_TYPES.IMAGE]: (graphic: ImageStoreModel, props: ImageMutableSerialized): void => {
        if (props.origin) {
            setVector(props.origin, graphic.origin);
        }

        if (props.dimensions) {
            if (props.dimensions.x) {
                graphic.width = props.dimensions.x;
            }

            if (props.dimensions.y) {
                graphic.height = props.dimensions.y;
            }
        }

        if (props.rotation) {
            graphic.rotation = props.rotation;
        }
    },
    [GRAPHIC_TYPES.RECTANGLE]: (graphic: RectangleStoreModel, props: RectangleMutableSerialized): void => {
        if (props.origin) {
            setVector(props.origin, graphic.origin);
        }

        if (props.dimensions) {
            if (props.dimensions.x) {
                graphic.width = props.dimensions.x;
            }

            if (props.dimensions.y) {
                graphic.height = props.dimensions.y;
            }
        }

        if (props.fillColor) {
            graphic.fillColor = props.fillColor;
        }

        if (props.rotation) {
            graphic.rotation = props.rotation;
        }

        if (props.strokeColor) {
            graphic.strokeColor = props.strokeColor;
        }

        if (props.strokeWidth) {
            graphic.strokeWidth = props.strokeWidth;
        }
    },
    [GRAPHIC_TYPES.TEXTBOX]: (graphic: TextboxStoreModel, props: TextboxMutableSerialized): void => {
        if (props.origin) {
            setVector(props.origin, graphic.origin);
        }

        if (props.dimensions) {
            if (props.dimensions.x) {
                graphic.width = props.dimensions.x;
            }

            if (props.dimensions.y) {
                graphic.height = props.dimensions.y;
            }
        }

        if (props.rotation) {
            graphic.rotation = props.rotation;
        }

        if (props.font) {
            graphic.font = props.font;
        }

        if (props.size) {
            graphic.size = props.size;
        }

        if (props.text) {
            graphic.text = props.text;
        }

        if (props.weight) {
            graphic.weight = props.weight;
        }
    },
    [GRAPHIC_TYPES.VIDEO]: (graphic: VideoStoreModel, props: VideoMutableSerialized): void => {
        if (props.origin) {
            setVector(props.origin, graphic.origin);
        }

        if (props.dimensions) {
            if (props.dimensions.x) {
                graphic.width = props.dimensions.x;
            }

            if (props.dimensions.y) {
                graphic.height = props.dimensions.y;
            }
        }

        if (props.rotation) {
            graphic.rotation = props.rotation;
        }

        if (props.strokeColor) {
            graphic.strokeColor = props.strokeColor;
        }

        if (props.strokeWidth) {
            graphic.strokeWidth = props.strokeWidth;
        }
    }
} as { [key in GRAPHIC_TYPES]: (graphic: GraphicStoreModel, props: GraphicMutableSerialized) => void };

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
        setProps: (slideId, graphicId, graphicType, props, emit = true) => {
            const slide = getSlide(state, slideId);
            if (slide === undefined) {
                return;
            }

            const graphic = slide.graphics[graphicId];
            if (!graphic) {
                return;
            }

            const setter = propSetters[graphicType];
            setter(graphic, props);

            if (emit) {
                dispatch<GraphicUpdatedPayload>(GRAPHIC_EVENT_CODES.UPDATED, {
                    slideId,
                    graphicType,
                    graphicId,
                    props
                });
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
