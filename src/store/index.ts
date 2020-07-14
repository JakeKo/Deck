import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
import { themes } from "../styling";
import { THEMES } from "../styling/types";
import NullTool from "../tools/NullTool";
import actions from './actions';
import getters from './getters';
import mutations from './mutations';
import { AppState } from "./types";

const store: StoreOptions<AppState> = {
    state: {
        activeSlideId: '',
        slides: [],
        activeTool: NullTool,
        deckTitle: undefined,
        theme: themes[THEMES.LIGHT],
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
