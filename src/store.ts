import Vue from "vue";
import Vuex from "vuex";
import ShapeModel from "./models/ShapeModel";
import SlideModel from "./models/SlideModel";
import * as Utilities from "./utilities/store";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        activeSlideId: "",
        focusedShapeId: "",
        canvas: {
            height: 2000,
            width: 4000
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
            // TODO: Search all slides for redundancy
            const activeSlide: SlideModel = Utilities.getSlide(state.slides, state.activeSlideId);
            const shapes: ShapeModel[] = activeSlide.shapes.filter((shape) => shape.id === state.focusedShapeId);

            if (shapes.length !== 1) {
                console.error(`There are ${shapes.length} focused shapes`);
                return undefined;
            }

            return shapes[0];
        }
    },
    mutations: {
        setActiveSlide: (state, slideId: string): void => {
            state.activeSlideId = slideId;
        },
        setFocusedShape: (state, shapeId: string): void => {
            state.focusedShapeId = shapeId;
        },
        addSlideAfterSlideWithId: (state, slideId: string): void => {
            const newSlide: SlideModel = new SlideModel();
            const index: number = slideId ? state.slides.indexOf(Utilities.getSlide(state.slides, slideId)) : 0;
            state.slides.splice(index + 1, 0, newSlide);
            state.activeSlideId = newSlide.id;
        },
        addShapeToSlideWithId: (state, slideId: string): void => {
            const shape: ShapeModel = new ShapeModel();
            const slide: SlideModel = Utilities.getSlide(state.slides, slideId);
            slide.shapes.push(shape);
        }
    }
});
