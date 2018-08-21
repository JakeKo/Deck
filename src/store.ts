import Vue from "vue";
import Vuex from "vuex";
import ShapeModel from "./models/ShapeModel";
import SlideModel from "./models/SlideModel";
import Point from "./models/Point";
import * as Utilities from "./utilities/store";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        activeSlideId: "",
        canvas: {
            height: 2000,
            width: 4000
        },
        styleEditor: {
            width: 450
        },
        roadmap: {
            height: 96
        },
        slides: new Array<SlideModel>()
    },
    getters: {
        slides: (state): SlideModel[] => {
            return state.slides;
        },
        firstSlide: (state): SlideModel => {
            if (state.slides.length === 0) {
                console.error("There are 0 slides");
            }

            return state.slides[0];
        },
        activeSlide: (state): SlideModel | undefined => {
            return state.slides.length === 0 ? undefined : Utilities.getSlide(state.slides, state.activeSlideId);
        },
        focusedShape: (state): ShapeModel | undefined => {
            const activeSlide: SlideModel = Utilities.getSlide(state.slides, state.activeSlideId);
            const shapes: ShapeModel[] = activeSlide.shapes.filter((shape) => shape.id === activeSlide.focusedShapeId);

            if (shapes.length > 1 || shapes.length < 0) {
                console.error(`There are ${shapes.length} focused shapes`);
                return undefined;
            } else if (shapes.length === 0) {
                return undefined;
            }

            return shapes[0];
        },
        styleEditorWidth: (state): number => {
            return state.styleEditor.width;
        },
        roadmapHeight: (state): number => {
            return state.roadmap.height;
        }
    },
    mutations: {
        setActiveSlide: (state, slideId: string): void => {
            state.activeSlideId = slideId;
        },
        setFocusedShape: (state, shapeId: string): void => {
            const activeSlide = Utilities.getSlide(state.slides, state.activeSlideId);
            activeSlide.focusedShapeId = shapeId;
        },
        addSlideAfterSlideWithId: (state, slideId: string): void => {
            const newSlide: SlideModel = new SlideModel();
            const index: number = slideId ? state.slides.indexOf(Utilities.getSlide(state.slides, slideId)) : 0;
            state.slides.splice(index + 1, 0, newSlide);
            state.activeSlideId = newSlide.id;
        },
        addShapeToSlideWithId: (state, slideId: string): void => {
            const shape: ShapeModel = new ShapeModel({
                points: [
                    new Point(100, 10),
                    new Point(40, 198),
                    new Point(190, 78),
                    new Point(10, 78),
                    new Point(160, 198)
                ]
            });
            const slide: SlideModel = Utilities.getSlide(state.slides, slideId);
            slide.shapes.push(shape);
        },
        setStyleEditorWidth: (state, width: number): void => {
            state.styleEditor.width = width;
        },
        setRoadmapHeight: (state, height: number): void => {
            state.roadmap.height = height;
        }
    }
});
