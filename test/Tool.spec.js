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
        
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.isVueInstance()).toBe(true);
        expect(wrapper.is(Tool)).toBe(true);
    });

    it("is inactive by default", () => {
        const wrapper = shallowMount(Tool, { store, localVue });
        
        expect(wrapper.props("isActive")).toBe(false);
    });

    it("is highlighted when it is active", () => {
        const wrapper = shallowMount(Tool, {
            store,
            localVue,
            propsData: {
                isActive: true
            }
        });
        
        expect(wrapper.props("isActive")).toBe(true);
        expect(wrapper.contains("#tool-icon")).toBe(true);
        expect(wrapper.find("#tool-icon").element.style.background).toBe("blue");
    });

    it("is muted when it is inactive", () => {
        const wrapper = shallowMount(Tool, {
            store,
            localVue,
            propsData: {
                isActive: false
            }
        });
        
        expect(wrapper.props("isActive")).toBe(false);
        expect(wrapper.contains("#tool-icon")).toBe(true);
        expect(wrapper.find("#tool-icon").element.style.background).toBe("rgb(221, 221, 221)");
    });
});
