import Vue from "vue";
import Vuex from "vuex";
import ShapeModel from "./models/ShapeModel";
import SlideModel from "./models/SlideModel";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        slides: [
            new SlideModel(undefined, true)
        ]
    },
    getters: {
        activeSlide: (state) => {
            const slides = state.slides.filter((s) => s.active);

            if (slides.length > 1) {
                console.error("More than one active slide");
            }

            return slides[0];
        }
    },
    mutations: {
        addSlide: (state) => {
            const lastSlideId = state.slides.length > 0 ? state.slides[state.slides.length - 1].id : undefined;

            state.slides.push(new SlideModel(undefined, false, lastSlideId));
        },
        addShapeToSlide: (state, { slideId, shapeModel }: { slideId: String, shapeModel: ShapeModel }) => {
            const slides = state.slides.filter((s) => s.id === slideId);

            if (slides.length > 1) {
                console.error("More than one slide with id");
            }

            slides[0].shapes.push(shapeModel);
        }
    }
});
