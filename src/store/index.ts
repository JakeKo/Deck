import { dispatch } from '@/events';
import { GraphicCreatedPayload, GraphicDeletedPayload, GraphicFocusedPayload, GraphicUnfocusedPayload, GraphicUpdatedPayload, GRAPHIC_EVENT_CODES } from '@/events/types';
import { GRAPHIC_TYPES } from '@/rendering/types';
import { themes } from '@/styling';
import { THEMES } from '@/styling/types';
import NullTool from '@/tools/NullTool';
import {
    CurveMutableSerialized,
    CurveSerialized,
    EllipseMutableSerialized,
    EllipseSerialized,
    GraphicMutableSerialized,
    GraphicSerialized,
    ImageMutableSerialized,
    ImageSerialized,
    RectangleMutableSerialized,
    RectangleSerialized,
    TextboxMutableSerialized,
    TextboxSerialized,
    VideoMutableSerialized,
    VideoSerialized
} from '@/types';
import { provideId } from '@/utilities/IdProvider';
import { inject, reactive } from 'vue';
import {
    AppMutations,
    AppState,
    AppStore
} from './types';
import { getSlide } from './utilities';

function setVector(source: { x?: number; y?: number }, target: { x: number; y: number }): void {
    if (source.x) {
        target.x = source.x;
    }

    if (source.y) {
        target.y = source.y;
    }
}

const propSetters = {
    [GRAPHIC_TYPES.CURVE]: (graphic: CurveSerialized, props: CurveMutableSerialized): void => {
        if (props.anchors) {
            props.anchors.forEach((sourceAnchor, index) => {
                if (!sourceAnchor) {
                    return;
                }

                if (!graphic.anchors[index]) {
                    graphic.anchors[index] = {
                        inHandle: { x: sourceAnchor.inHandle?.x ?? 0, y: sourceAnchor.inHandle?.y ?? 0 },
                        point: { x: sourceAnchor.point?.x ?? 0, y: sourceAnchor.point?.y ?? 0 },
                        outHandle: { x: sourceAnchor.outHandle?.x ?? 0, y: sourceAnchor.outHandle?.y ?? 0 }
                    };
                } else {
                    const targetAnchor = graphic.anchors[index];
                    if (sourceAnchor.inHandle) {
                        setVector(sourceAnchor.inHandle, targetAnchor.inHandle);
                    }

                    if (sourceAnchor.point) {
                        setVector(sourceAnchor.point, targetAnchor.point);
                    }

                    if (sourceAnchor.outHandle) {
                        setVector(sourceAnchor.outHandle, targetAnchor.outHandle);
                    }
                }
            });
        }

        if (props.fillColor) {
            graphic.fillColor = props.fillColor;
        }

        if (props.rotation !== undefined) {
            graphic.rotation = props.rotation;
        }

        if (props.strokeWidth) {
            graphic.strokeWidth = props.strokeWidth;
        }

        if (props.strokeColor) {
            graphic.strokeColor = props.strokeColor;
        }
    },
    [GRAPHIC_TYPES.ELLIPSE]: (graphic: EllipseSerialized, props: EllipseMutableSerialized): void => {
        if (props.center) {
            setVector(props.center, graphic.center);
        }

        if (props.dimensions) {
            setVector(props.dimensions, graphic.dimensions);
        }

        if (props.fillColor) {
            graphic.fillColor = props.fillColor;
        }

        if (props.rotation !== undefined) {
            graphic.rotation = props.rotation;
        }

        if (props.strokeColor) {
            graphic.strokeColor = props.strokeColor;
        }

        if (props.strokeWidth) {
            graphic.strokeWidth = props.strokeWidth;
        }
    },
    [GRAPHIC_TYPES.IMAGE]: (graphic: ImageSerialized, props: ImageMutableSerialized): void => {
        if (props.origin) {
            setVector(props.origin, graphic.origin);
        }

        if (props.dimensions) {
            setVector(props.dimensions, graphic.dimensions);
        }

        if (props.rotation !== undefined) {
            graphic.rotation = props.rotation;
        }
    },
    [GRAPHIC_TYPES.RECTANGLE]: (graphic: RectangleSerialized, props: RectangleMutableSerialized): void => {
        if (props.origin) {
            setVector(props.origin, graphic.origin);
        }

        if (props.dimensions) {
            setVector(props.dimensions, graphic.dimensions);
        }

        if (props.fillColor) {
            graphic.fillColor = props.fillColor;
        }

        if (props.rotation !== undefined) {
            graphic.rotation = props.rotation;
        }

        if (props.strokeColor) {
            graphic.strokeColor = props.strokeColor;
        }

        if (props.strokeWidth) {
            graphic.strokeWidth = props.strokeWidth;
        }
    },
    [GRAPHIC_TYPES.TEXTBOX]: (graphic: TextboxSerialized, props: TextboxMutableSerialized): void => {
        if (props.origin) {
            setVector(props.origin, graphic.origin);
        }

        if (props.dimensions) {
            setVector(props.dimensions, graphic.dimensions);
        }

        if (props.rotation !== undefined) {
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
    [GRAPHIC_TYPES.VIDEO]: (graphic: VideoSerialized, props: VideoMutableSerialized): void => {
        if (props.origin) {
            setVector(props.origin, graphic.origin);
        }

        if (props.dimensions) {
            setVector(props.dimensions, graphic.dimensions);
        }

        if (props.rotation !== undefined) {
            graphic.rotation = props.rotation;
        }

        if (props.strokeColor) {
            graphic.strokeColor = props.strokeColor;
        }

        if (props.strokeWidth) {
            graphic.strokeWidth = props.strokeWidth;
        }
    }
} as { [key in GRAPHIC_TYPES]: (graphic: GraphicSerialized, props: GraphicMutableSerialized) => void };

function createStore(): AppStore {
    const state = reactive<AppState>({
        eventPublisherId: 'store',
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
                    focusedGraphics: {}
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
        createGraphic: (slideId, props, emit = true) => {
            const slide = getSlide(state, slideId);
            if (slide === undefined) {
                return;
            }

            const preexistingGraphic = slide.graphics[props.id];
            if (preexistingGraphic) {
                throw new Error(`Attempting to create a graphic with a duplicate ID ${props.id}`);
            }

            slide.graphics[props.id] = props;

            if (emit) {
                dispatch<GraphicCreatedPayload>(GRAPHIC_EVENT_CODES.CREATED, {
                    publisherId: state.eventPublisherId,
                    slideId,
                    props
                });
            }
        },
        focusGraphic: (slideId, graphicId, emit = true) => {
            const slide = getSlide(state, slideId);
            if (slide !== undefined && !slide.focusedGraphics[graphicId] && slide.graphics[graphicId]) {
                slide.focusedGraphics[graphicId] = slide.graphics[graphicId];
            }

            if (emit) {
                dispatch<GraphicFocusedPayload>(GRAPHIC_EVENT_CODES.FOCUSED, {
                    publisherId: state.eventPublisherId,
                    slideId,
                    graphicId
                });
            }
        },
        unfocusGraphic: (slideId, graphicId, emit = true) => {
            const slide = getSlide(state, slideId);
            if (slide !== undefined && slide.focusedGraphics[graphicId]) {
                delete slide.focusedGraphics[graphicId];
            }

            if (emit) {
                dispatch<GraphicUnfocusedPayload>(GRAPHIC_EVENT_CODES.UNFOCUSED, {
                    publisherId: state.eventPublisherId,
                    slideId,
                    graphicId
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
        setProps: (slideId, graphicId, graphicType, props, emit = true) => {
            const slide = getSlide(state, slideId);
            if (slide === undefined) {
                return;
            }

            const graphic = slide.graphics[graphicId];
            if (!graphic) {
                return;
            }

            propSetters[graphicType](graphic, props);

            if (emit) {
                dispatch<GraphicUpdatedPayload>(GRAPHIC_EVENT_CODES.UPDATED, {
                    publisherId: state.eventPublisherId,
                    slideId,
                    graphicType,
                    graphicId,
                    props
                });
            }
        },
        removeGraphic: (slideId, graphicId, emit = true) => {
            const slide = getSlide(state, slideId);
            if (slide !== undefined) {
                delete slide.graphics[graphicId];
            }

            if (emit) {
                dispatch<GraphicDeletedPayload>(GRAPHIC_EVENT_CODES.DELETED, {
                    publisherId: state.eventPublisherId,
                    slideId,
                    graphicId
                });
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
