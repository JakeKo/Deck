import { AppState, Slide } from "./types";

export const getSlide: (state: AppState, slideId: string) => Slide | undefined = (state, slideId) => {
    return state.slides.find(s => s.id === slideId);
};
