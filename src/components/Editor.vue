<template>
<div id='editor'>
    <div v-if='slides.length === 0' id='empty-slide-container' :style='emptySlideContainerStyle'>
        <div id='empty-slide' :style='emptySlideStyle' />
    </div>
    <slide v-for='slide in slides' 
        :key='slide.id'
        :id='slide.id'
        :isActive='slide.isActive'
    />
</div>
</template>

<script lang='ts'>
import { Vue, Component, Watch } from 'vue-property-decorator';
import Slide from './Slide.vue';
import { MUTATIONS, GETTERS } from '../store/types';

@Component({
    components: {
        Slide
    }
})
export default class Editor extends Vue {
    private get activeSlideId(): string | undefined {
        return this.$store.getters[GETTERS.ACTIVE_SLIDE] === undefined
            ? undefined
            : this.$store.getters[GETTERS.ACTIVE_SLIDE].id;
    }

    private get zoomLevel(): number {
        return this.$store.getters[GETTERS.EDITOR_ZOOM_LEVEL];
    }

    // TODO: Incorporate Slide type
    private get slides(): any[] {
        return this.$store.getters[GETTERS.SLIDES].map((s: any) => ({
            id: s.id,
            isActive: s.id === this.$store.getters[GETTERS.ACTIVE_SLIDE].id
        }));
    }

    private get emptySlideContainerStyle(): { minWidth: string; minHeight: string; } {
        return {
            minWidth: `${this.$store.getters[GETTERS.RAW_VIEWBOX].width}px`,
            minHeight: `${this.$store.getters[GETTERS.RAW_VIEWBOX].height}px`
        };
    }

    private get emptySlideStyle(): { width: string; height: string; } {
        return {
            width: `${this.$store.getters[GETTERS.CROPPED_VIEWBOX].width}px`,
            height: `${this.$store.getters[GETTERS.CROPPED_VIEWBOX].height}px`
        };
    }

    // Recenter the editor view when the active slide changes
    @Watch('activeSlideId')
    private onActiveSlideIdUpdate(): void {
        const editor = this.$el as HTMLElement;
        editor.scrollTop = (editor.scrollHeight - editor.clientHeight) / 2;
        editor.scrollLeft = (editor.scrollWidth - editor.clientWidth) / 2;
    }

    @Watch('zoomLevel')
    private onZoomLevelUpdate(zoomLevel: number): void {
       (this.$el as HTMLElement).style.zoom = zoomLevel.toString();
    }

    private mounted(): void {
        const editor = this.$el as HTMLElement;
        const editorWidth = editor.offsetWidth;
        const editorHeight = editor.offsetHeight;
        const slideWidth = this.$store.getters[GETTERS.CROPPED_VIEWBOX].width + 100;
        const slideHeight = this.$store.getters[GETTERS.CROPPED_VIEWBOX].height + 100;
        const scale = Math.min(editorWidth / slideWidth, editorHeight / slideHeight);

        // Set the scale based on screen size and slide size
        // Then center the view on the slide
        this.$store.commit(MUTATIONS.EDITOR_ZOOM_LEVEL, scale);
        editor.style.zoom = scale.toString();
        editor.scrollTop = (editor.scrollHeight - editor.offsetHeight) / 2;
        editor.scrollLeft = (editor.scrollWidth - editor.offsetWidth) / 2;
    }
}
</script>

<style lang='scss' scoped>
@import '../styles/colors';

#editor {
    display: flex;
    flex-grow: 1;
    overflow: scroll;
    background: $color-tertiary;
}

#empty-slide-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

#empty-slide {
    border: 4px dashed grey;
}

::-webkit-scrollbar {
    display: none;
}
</style>
