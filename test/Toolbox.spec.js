import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Store from "../src/store";
import Toolbox from "../src/components/Toolbox.vue";
import Tool from "../src/components/Tool.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("Toolbox", () => {
    let store = undefined;
    beforeEach(() => store = Store);

    it("can instantiate", () => {
        // Arrange
        const wrapper = shallowMount(Toolbox, { store, localVue });
        
        // Act

        // Assert
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.isVueInstance()).toBe(true);
        expect(wrapper.is(Toolbox)).toBe(true);
    });

    it("has the correct number of tools", () => {
        // Arrange
        const wrapper = shallowMount(Toolbox, { store, localVue });

        // Act

        // Assert
        expect(wrapper.findAll(Tool).length).toBe(7);
    });

    it("has the correct number of active and inactive tools", () => {
        // Arrange
        const wrapper = shallowMount(Toolbox, { store, localVue });
        const toolWrappers = wrapper.findAll(Tool).wrappers;

        // Act

        // Assert
        expect(toolWrappers.filter((toolWrapper) => toolWrapper.props("isActive")).length).toBe(1);
        expect(toolWrappers.filter((toolWrapper) => !toolWrapper.props("isActive")).length).toBe(6);
    });
});
