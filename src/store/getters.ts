import { AppGetters, AppState, RoadmapSlide } from './types';
import { getSlide } from './utilities';
import { getBaseStyles } from '@/styling';

const getters: (state: AppState) => AppGetters = state => ({
    slides: state.slides,
    roadmapSlides: state.slides.map<RoadmapSlide>(s => s),
    lastSlide: state.slides[state.slides.length - 1],
    activeSlide: getSlide(state, state.activeSlideId),
    activeToolName: state.activeTool.name,
    rawViewbox: state.editorViewbox.raw,
    croppedViewbox: state.editorViewbox.cropped,
    editorZoomLevel: state.editorViewbox.zoom,
    deckTitle: state.deckTitle,
    style: {
        theme: state.theme,
        baseStyle: getBaseStyles(state.theme)
    }
});

export default getters;
