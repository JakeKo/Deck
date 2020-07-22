<template>
<div :style="editorStyle" @mousewheel='handleMouseWheel'>
    <slide-placeholder v-if='getSlides.length === 0' />
    <slide v-for='slide in getSlides' 
        :key='slide.id'
        :id='slide.id'
        :isActive='slide.isActive'
        :stateManager='slide.stateManager'
    />
</div>
</template>

<script lang='ts'>
import { Vue, Component, Watch } from 'vue-property-decorator';
import Slide from './Slide.vue';
import { MUTATIONS, GETTERS, Viewbox, Slide as SlideModel } from '../store/types';
import { Getter, Mutation } from 'vuex-class';
import Vector from '../utilities/Vector';
import SlidePlaceholder from './SlidePlaceholder.vue';
import { StyleCreator } from '../styling/types';
import DeckComponent from './generic/DeckComponent';
import { dispatch } from '../events/utilities';
import { SlideZoomEventPayload, SLIDE_EVENTS } from '../events/types';

type StyleProps = {};
type Style = {
    editor: any;
};
const componentStyle: StyleCreator<StyleProps, Style> = ({ theme, base, props }) => ({
    editor: {
        display: 'flex',
        flexGrow: '1',
        overflow: 'scroll',
        background: theme.color.base.flush
    }
});

@Component({
    components: {
        Slide,
        SlidePlaceholder
    }
})
export default class Editor extends DeckComponent<StyleProps, Style> {
    @Getter private [GETTERS.ACTIVE_SLIDE]: SlideModel;
    @Getter private [GETTERS.EDITOR_ZOOM_LEVEL]: number;
    @Getter private [GETTERS.SLIDES]: SlideModel[];
    @Getter private [GETTERS.CROPPED_VIEWBOX]: Viewbox;
    @Mutation private [MUTATIONS.EDITOR_ZOOM_LEVEL]: (zoomLevel: number) => void;

    private get editorStyle(): any {
        const style = this[GETTERS.STYLE]({}, componentStyle);
        return style.editor;
    }

    // Set the default zoom based on screen size and slide size
    private get defaultZoom(): number {
        const editor = this.$el as HTMLElement;
        const editorWidth = editor.offsetWidth;
        const editorHeight = editor.offsetHeight;
        const slideWidth = this[GETTERS.CROPPED_VIEWBOX].width + 100;
        const slideHeight = this[GETTERS.CROPPED_VIEWBOX].height + 100;
        return Math.min(editorWidth / slideWidth, editorHeight / slideHeight);
    }

    // Reorient the editor view when the active slide changes
    @Watch(GETTERS.ACTIVE_SLIDE)
    private onActiveSlideIdUpdate(): void {
        this.reorientSlide();
    }

    public mounted(): void {
        this.bindEvents();
        this.reorientSlide();
    }

    // Set the zoom level, then center the view on the slide
    // Note: Editor zoom must be set manually to avoid scrolling before zooming
    private reorientSlide(): void {
        const editor = this.$el as HTMLElement;
        this[MUTATIONS.EDITOR_ZOOM_LEVEL](this.defaultZoom);
        editor.style.zoom = this.defaultZoom.toString();
        editor.scrollTop = (editor.scrollHeight - editor.clientHeight) / 2;
        editor.scrollLeft = (editor.scrollWidth - editor.clientWidth) / 2;

        dispatch(new CustomEvent<SlideZoomEventPayload>(SLIDE_EVENTS.ZOOM, { detail: { zoom: this.defaultZoom } }));
    }

    private handleMouseWheel(event: WheelEvent): void {
        if (event.ctrlKey) {
            event.preventDefault();

            const editor = this.$el as HTMLElement;
            const deltaZoom = event.deltaY < 0 ? 1.1 : 0.9;
            const oldZoom = this[GETTERS.EDITOR_ZOOM_LEVEL];
            const newZoom = this[GETTERS.EDITOR_ZOOM_LEVEL] * deltaZoom;
            this[MUTATIONS.EDITOR_ZOOM_LEVEL](newZoom);
            editor.style.zoom = newZoom.toString();

            dispatch(new CustomEvent<SlideZoomEventPayload>(SLIDE_EVENTS.ZOOM, { detail: { zoom: newZoom } }));

            // TODO: Fetch absolute mouse position without hardcoded values
            // TODO: Fix the math here (which is incorrect but not by much)
            const absolutePosition = new Vector(event.clientX - 64, event.clientY - 28);
            const absoluteDestination = absolutePosition.scale(1 / deltaZoom);
            const scrollCorrection = absoluteDestination.towards(absolutePosition);
            editor.scrollLeft = editor.scrollLeft + scrollCorrection.x;
            editor.scrollTop = editor.scrollTop + scrollCorrection.y;
        }
    }
}
</script>
