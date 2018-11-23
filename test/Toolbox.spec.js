import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Store from "../src/store";
import Toolbox from "../src/components/Toolbox.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("Toolbox", () => {
    let store = undefined;
    beforeEach(() => store = Store);

    it("can instantiate", () => {
        const wrapper = shallowMount(Toolbox, { store, localVue });
        
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.isVueInstance()).toBe(true);
        expect(wrapper.is(Toolbox)).toBe(true);
    });

    it("has four tools", () => {
        const wrapper = shallowMount(Toolbox, { store, localVue });
        
        expect(wrapper.findAll(".tool").length).toBe(6);
    });

    it("has one active tool", () => {
        const wrapper = shallowMount(Toolbox, { store, localVue });
        
        const icons = wrapper.findAll(".tool-icon").wrappers.map((w) => w.element);
        expect(icons.filter((element) => element.style.background === "blue").length).toBe(1);
    });

    it("has three inactive tools", () => {
        const wrapper = shallowMount(Toolbox, { store, localVue });
        
        const icons = wrapper.findAll(".tool-icon").wrappers.map((w) => w.element);
        expect(icons.filter((element) => element.style.background === "rgb(221, 221, 221)").length).toBe(5);
    });
});
