import Vue from "vue";
import Vuex from "vuex";
import ShapeModel from "./models/ShapeModel";
import SlideModel from "./models/SlideModel";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        slides: [
            new SlideModel({ active: true })
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
        addSlide: (state, { previous, next }: { previous: String, next: String }) => {
            const newSlide = new SlideModel({ previous, next });

            if (previous) {
                const slides = state.slides.filter((s) => s.id === previous);

                if (slides.length > 1) {
                    console.error("More than one slide with id");
                } else if (slides.length === 0) {
                    console.error("No slide with id");
                } else {
                    slides[0].next = newSlide.id;
                }
            }

            if (next) {
                const slides = state.slides.filter((s) => s.id === next);

                if (slides.length > 1) {
                    console.error("More than one slide with id");
                } else if (slides.length === 0) {
                    console.error("No slide with id");
                } else {
                    slides[0].previous = newSlide.id;
                }
            }

            state.slides.push(newSlide);
        },
        addShapeToSlide: (state, { slideId, shape }: { slideId: String, shape: ShapeModel }) => {
            const slides = state.slides.filter((s) => s.id === slideId);

            if (slides.length > 1) {
                console.error("More than one slide with id");
            }

            slides[0].shapes.push(shape);
        }
    }
});
