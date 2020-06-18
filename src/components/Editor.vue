<template>
<div id='editor'>
    <!-- <slide-settings></slide-settings> -->
    <div id='canvas-container' ref='canvas-container'>
        <div id='canvas' ref='canvas' :style='canvasStyle'>
            <slide v-for='slide in slides' 
                :key='slide.key'
                :isActive='slide.isActive'
            />
        </div>
    </div>
</div>
</template>

<script lang='ts'>
import { Vue, Component, Watch } from 'vue-property-decorator';
import Slide from './Slide.vue';
// import SlideSettings from './SlideSettings.vue';

@Component({
    components: {
        Slide,
        // SlideSettings
    }
})
export default class Editor extends Vue {
    // @Watch('$store.getters.canvasZoom') private onCanvasZoomChanged(): void {
    //     // Modify the zoom styling of the editor when the zoom is updated
    //     const container: HTMLDivElement = this.$refs['canvas-container'] as HTMLDivElement;
    //     const percentageDown = container.scrollTop / container.scrollHeight;
    //     const percentageOver = container.scrollLeft / container.scrollWidth;

    //     (this.$refs['canvas'] as HTMLDivElement).style.zoom = this.$store.getters.canvasZoom;
    //     container.scrollTop = container.scrollHeight * percentageDown;
    //     container.scrollLeft = container.scrollWidth * percentageOver;
    // }

    private slides = [
        {
            key: Math.random(),
            isActive: true
        }
    ];

    get canvasStyle(): any {
        return {
            width: `${this.$store.getters.rawEditorViewbox.width}px`,
            height: `${this.$store.getters.rawEditorViewbox.height}px`
        };
    }

    private mounted(): void {
        // Scroll to the middle of the editor
        const container = this.$refs['canvas-container'] as HTMLDivElement;
        container.scrollLeft = (this.$store.getters.rawEditorViewbox.width - container.clientWidth) / 2;
        container.scrollTop = (this.$store.getters.rawEditorViewbox.height - container.clientHeight) / 2;
    }
}
</script>

<style lang='scss' scoped>
@import '../styles/colors';

#editor {
    display: flex;
    flex-grow: 1;
    min-height: 0;
}

#canvas-container {
    overflow: scroll;
}

#canvas {
    background: $color-secondary;
}
</style>
