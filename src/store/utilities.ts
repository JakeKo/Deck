import { AppState, Slide } from './types';

export function getSlide(state: AppState, slideId: string): Slide | undefined {
    return state.slides.find(s => s.id === slideId);
}
