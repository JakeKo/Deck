import { AppState, Slide } from "./types";

export function getSlide(state: AppState, slideId: string): Slide | undefined {
    return state.slides.find(s => s.id === slideId);
}

export function getGraphicIndex(state: AppState, slideId: string, graphicId: string): number | undefined {
    const slide = getSlide(state, slideId);
    if (slide === undefined) {
        return;
    }

    const index = slide.graphics.findIndex(g => g.id === graphicId);
    return index === -1 ? undefined : index;
}
