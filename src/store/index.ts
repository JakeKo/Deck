import Vuex, { StoreOptions } from "vuex";
import { AppState } from "./types";
import getters from './getters';
import mutations from './mutations';
import actions from './actions';
import Vue from "vue";
import NullTool from "../tools/NullTool";

const store: StoreOptions<AppState> = {
    state: {
        activeSlideId: '',
        slides: [],
        activeTool: NullTool,
        editorViewbox: {
            zoom: 1,
            raw: {
                x: -1920,
                y: -1080,
                width: 5760,
                height: 3240
            },
            cropped: {
                x: 0,
                y: 0,
                width: 1920,
                height: 1080
            }
        }
    },
    getters,
    mutations,
    actions
};

Vue.use(Vuex);
export default new Vuex.Store(store);
