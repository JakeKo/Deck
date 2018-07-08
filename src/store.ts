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
                    new ShapeModel().ToJson(),
                    new ShapeModel().ToJson(),
                ]
            }
        ]
    },
    getters: {
        activeSlide: (state) => {
            const slide = state.slides.filter((s) => s.active);

            if (slide.length > 1) {
                console.error("More than one active slide");
            }

            return slide[0];
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
            const slide = state.slides.filter((s) => s.id === slideId)[0];
            slide.shapes.push(shapeModel.ToJson());
        }
    }
});
