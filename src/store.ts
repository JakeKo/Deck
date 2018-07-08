import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const generateId = () => {
    const s4 = () => Math.floor(( Math.random() + 1) * 0x10000).toString(16).substring(1).toLocaleUpperCase();
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

export default new Vuex.Store({
    state: {
        slides: [
            {
                id: generateId(),
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
    mutations: {
        addSlide(state) {
            state.slides.push({
                id: generateId(),
                previous: state.slides[state.slides.length - 1].id,
                next: "",
                shapes: []
            });
        },
        addShape(state, { slideId, shape }) {
            const slide = state.slides.filter((s) => s.id === slideId)[0];
            const newShape = shape || {};

            if (newShape.id === undefined) {
                newShape.id = generateId();
            }

            slide.shapes.push(newShape);
        }
    }
});
