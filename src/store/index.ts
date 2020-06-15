import Vuex, { StoreOptions } from "vuex";
import { ApplicationState } from "./types";
import getters from './getters';
import mutations from './mutations';
import actions from './actions';
import Vue from "vue";

const store: StoreOptions<ApplicationState> = {
    state: {

    },
    getters,
    mutations,
    actions
};

Vue.use(Vuex);
export default new Vuex.Store(store);
