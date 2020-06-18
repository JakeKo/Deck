import { AppMutations, AppState, EditorTools } from "./types";

const mutations: AppMutations = {
    addSlide: (state: AppState, index: number): void => {
        state.slides = [
            ...state.slides.slice(0, index),
            {},
            ...state.slides.slice(index)
        ];
    },
    setActiveSlideId: (state: AppState, slideId: string): void => {
        state.activeSlideId = slideId;
    },
    setActiveTool: (state: AppState, toolName: keyof EditorTools): void => {
        state.tools[state.activeToolName].unmount();
        state.activeToolName = toolName;
        state.tools[state.activeToolName].mount();
    }
};

export default mutations;
