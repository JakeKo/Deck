import Vue from "vue";
import Vuex from "vuex";
import Shape from "./components/Shape.vue";

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
                    {
                        id: generateId(),
                        backgroundColor: "pink",
                        height: "200px",
                        width: "200px"
                    },
                    {
                        id: generateId(),
                        backgroundColor: "blue",
                        height: "150px",
                        width: "200px"
                    }
                ]
            }
        ]
    },
    getters: {
        getActiveSlide: (state) => {
            const slide = state.slides.filter((s) => s.active);

            if (slide.length > 1) {
                console.error("More than one active slide");
                return;
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
        addShape: (state, { slideId, shape }) => {
            const slide = state.slides.filter((s) => s.id === slideId)[0];
            const newShape = shape ? {
                id: generateId(),
                backgroundColor: shape.backgroundColor,
                height: shape.height,
                width: shape.width
            } : {
                id: generateId(),
                backgroundColor: undefined,
                height: undefined,
                width: undefined
            };

            slide.shapes.push(newShape);
        }
    }
});
