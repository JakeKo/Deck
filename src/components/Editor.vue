<template>
<div id='editor'>
    <div v-if='$store.getters.slides.length === 0' id='empty-slide-container' :style='emptySlideContainerStyle'>
        <div id='empty-slide' :style='emptySlideStyle' />
    </div>
    <slide v-for='slide in $store.getters.slides' 
        :key='slide.id'
        :id='slide.id'
        :isActive='slide.id === $store.getters.activeSlide.id'
    />
</div>
</template>

<script lang='ts'>
import { Vue, Component, Watch } from 'vue-property-decorator';
import Slide from './Slide.vue';

@Component({
    components: {
        Slide
    }
})
export default class Editor extends Vue {
    @Watch('$store.getters.editorZoomLevel')
    private onZoomLevelUpdate(): void {
       (this.$el as HTMLElement).style.zoom = this.$store.getters.editorZoomLevel.toString();
    }

    // Recenter the editor view when the active slide changes
    @Watch('$store.getters.activeSlide.id')
    private onActiveSlideIdUpdate(): void {
        const editor = this.$el as HTMLElement;
        editor.scrollTop = (editor.scrollHeight - editor.clientHeight) / 2;
        editor.scrollLeft = (editor.scrollWidth - editor.clientWidth) / 2;
    }

    private get emptySlideContainerStyle(): { minWidth: string; minHeight: string; } {
        return {
            minWidth: `${this.$store.getters.rawEditorViewbox.width}px`,
            minHeight: `${this.$store.getters.rawEditorViewbox.height}px`
        };
    }

    private get emptySlideStyle(): { width: string; height: string; } {
        return {
            width: `${this.$store.getters.croppedEditorViewbox.width}px`,
            height: `${this.$store.getters.croppedEditorViewbox.height}px`
        };
    }

    private mounted(): void {
        const editor = this.$el as HTMLElement;
        const editorWidth = editor.offsetWidth;
        const editorHeight = editor.offsetHeight;
        const slideWidth = this.$store.getters.croppedEditorViewbox.width + 100;
        const slideHeight = this.$store.getters.croppedEditorViewbox.height + 100;
        const scale = Math.min(editorWidth / slideWidth, editorHeight / slideHeight);

        // Set the scale based on screen size and slide size
        // Then center the view on the slide
        this.$store.commit('editorZoomLevel', scale);
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
