import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        slides: [
            {
                shapes: [
                    {
                        backgroundColor: "pink",
                        height: "200px",
                        width: "200px"
                    },
                    {
                        backgroundColor: "blue",
                        height: "150px",
                        width: "200px"
                    }
                ]
            }
        ]
    }
});
