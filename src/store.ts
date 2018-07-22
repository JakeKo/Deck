import Vue from "vue";
import Vuex from "vuex";
import ShapeModel from "./models/ShapeModel";
import SlideModel from "./models/SlideModel";
import * as Utilities from "./utilities/store";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        slides: [
            new SlideModel({ active: true })
        ]
    },
    getters: {
        activeSlide: (state): SlideModel => {
            const slides: SlideModel[] = state.slides.filter((s) => s.active);

            if (slides.length > 1) {
                console.error(`There are ${slides.length} active slides`);
            } else if (slides.length === 0) {
                console.error("There are no active slides");
            }

            return slides[0];
        }
    },
    mutations: {
        addSlide: (state, { previous, next }: { previous: string, next: string }): void => {
            const newSlide: SlideModel = new SlideModel({ previous, next });

            if (previous) {
                const slide: SlideModel = Utilities.getSlide(state.slides, previous);
                slide.next = newSlide.id;
            }

            if (next) {
                const slide: SlideModel = Utilities.getSlide(state.slides, next);
                slide.previous = newSlide.id;
            }

            state.slides.push(newSlide);
        },
        addShapeToSlide: (state, { slideId }: { slideId: string }): void => {
            const shape: ShapeModel = new ShapeModel();
            const slide: SlideModel = Utilities.getSlide(state.slides, slideId);
            slide.shapes.push(shape);
        }
    }
});
