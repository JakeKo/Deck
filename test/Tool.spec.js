import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Store from "../src/store";
import Tool from "../src/components/Tool.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("Tool", () => {
    let store = undefined;
    beforeEach(() => store = Store);

    it("can instantiate", () => {
        const wrapper = shallowMount(Tool, { store, localVue });
        
        expect(wrapper.is(Tool)).toBe(true);
    });

    it("is inactive by default", () => {
        const wrapper = shallowMount(Tool, { store, localVue });
        
        expect(wrapper.props("isActive")).toBe(false);
    });
});
