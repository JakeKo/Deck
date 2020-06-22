<template>
<div id='editor' :style='{ zoom: getEditorZoomLevel }'>
    <div v-if='getSlides.length === 0' id='empty-slide-container' :style='emptySlideContainerStyle'>
        <div id='empty-slide' :style='emptySlideStyle' />
    </div>
    <slide v-for='slide in getSlides' 
        :key='slide.id'
        :id='slide.id'
        :isActive='slide.isActive'
    />
</div>
</template>

<script lang='ts'>
import { Vue, Component, Watch } from 'vue-property-decorator';
import Slide from './Slide.vue';
import { MUTATIONS, GETTERS, Viewbox, Slide as SlideModel } from '../store/types';
import { Getter, Mutation } from 'vuex-class';

@Component({
    components: {
        Slide
    }
})
export default class Editor extends Vue {
    @Getter private [GETTERS.ACTIVE_SLIDE]: SlideModel;
    @Getter private [GETTERS.EDITOR_ZOOM_LEVEL]: number;
    @Getter private [GETTERS.SLIDES]: SlideModel[];
    @Getter private [GETTERS.RAW_VIEWBOX]: Viewbox;
    @Getter private [GETTERS.CROPPED_VIEWBOX]: Viewbox;
    @Mutation private [MUTATIONS.EDITOR_ZOOM_LEVEL]: (zoomLevel: number) => void;

    private get emptySlideContainerStyle(): { minWidth: string; minHeight: string; } {
        return {
            minWidth: `${this[GETTERS.RAW_VIEWBOX].width}px`,
            minHeight: `${this[GETTERS.RAW_VIEWBOX].height}px`
        };
    }

    private get emptySlideStyle(): { width: string; height: string; } {
        return {
            width: `${this[GETTERS.CROPPED_VIEWBOX].width}px`,
            height: `${this[GETTERS.CROPPED_VIEWBOX].height}px`
        };
    }

    // Recenter the editor view when the active slide changes
    @Watch(GETTERS.ACTIVE_SLIDE)
    private onActiveSlideIdUpdate(): void {
        const editor = this.$el as HTMLElement;
        editor.scrollTop = (editor.scrollHeight - editor.clientHeight) / 2;
        editor.scrollLeft = (editor.scrollWidth - editor.clientWidth) / 2;
    }

    private mounted(): void {
        const editor = this.$el as HTMLElement;
        const editorWidth = editor.offsetWidth;
        const editorHeight = editor.offsetHeight;
        const slideWidth = this[GETTERS.CROPPED_VIEWBOX].width + 100;
        const slideHeight = this[GETTERS.CROPPED_VIEWBOX].height + 100;
        const scale = Math.min(editorWidth / slideWidth, editorHeight / slideHeight);

        // Set the scale based on screen size and slide size
        // Then center the view on the slide
        this[MUTATIONS.EDITOR_ZOOM_LEVEL](scale);
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
