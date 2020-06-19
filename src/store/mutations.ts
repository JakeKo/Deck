import { AppMutations, AppState } from "./types";
import { EditorTool } from "../tools/types";

const mutations: AppMutations = {
    addSlide: (state: AppState, index: number): void => {
        state.slides = [
            ...state.slides.slice(0, index),
            { id: Math.random().toString() },
            ...state.slides.slice(index)
        ];
    },
    setActiveSlideId: (state: AppState, slideId: string): void => {
        state.activeSlideId = slideId;
    },
    setActiveTool: (state: AppState, tool: EditorTool): void => {
        state.activeTool.unmount();
        state.activeTool = tool;
        state.activeTool.mount();
    },
    editorZoomLevel: (state: AppState, zoomLevel: number): void => {
        state.editorViewbox.zoom = zoomLevel;
    }
};

export default mutations;
