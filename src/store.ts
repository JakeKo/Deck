import Vue from "vue";
import Vuex from "vuex";
import Shape from "./components/Shape.vue";
import ShapeModel from "./models/ShapeModel";

Vue.use(Vuex);

const generateId = () => {
    const s4 = () => Math.floor((Math.random() + 1) * 0x10000).toString(16).substring(1).toLocaleUpperCase();
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

export default new Vuex.Store({
    state: {
        slides: [
            {
                id: generateId(),
                active: true,
                previous: "",
                next: "",
                shapes: [
                    new ShapeModel(),
                    new ShapeModel(),
                ]
            }
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
            state.slides.push({
                id: generateId(),
                active: false,
                previous: "",
                next: "",
                shapes: []
            });
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
