<template>
<div id="editor" :style="editorStyle">
    <slide-settings></slide-settings>
    <div id="canvas-container" ref="canvas-container">
        <div id="canvas" :style="canvasStyle">
            <slide v-for="slide in $store.getters.slides" 
                :key="slide.id"
                :id="slide.id"
                :graphics="slide.graphics"
                :isActive="slide.id === $store.getters.activeSlide.id"
            ></slide>
        </div>
    </div>
</div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import Slide from "./Slide.vue";
import SlideSettings from "./SlideSettings.vue";

@Component({
    components: {
        Slide,
        SlideSettings
    }
})
export default class Editor extends Vue {
    private container!: HTMLDivElement;

    @Watch("canvasZoom") private onCanvasZoomChanged(): void {
        // Modify the zoom styling of the editor when the zoom is updated
        const percentageDown = this.container.scrollTop / this.container.scrollHeight;
        const percentageOver = this.container.scrollLeft / this.container.scrollWidth;
        document.getElementById("canvas")!.style.zoom = this.$store.getters.canvasZoom;
        this.container.scrollTop = this.container.scrollHeight * percentageDown;
        this.container.scrollLeft = this.container.scrollWidth * percentageOver;
    }

    get canvasZoom(): number {
        return this.$store.getters.canvasZoom;
    }

    get canvasStyle(): any {
        return {
            width: `${this.$store.getters.canvasWidth}px`,
            height: `${this.$store.getters.canvasHeight}px`
        };
    }

    get editorStyle(): any {
        return {
            height: `calc(100vh - ${this.$store.getters.roadmapHeight}px)`
        };
    }

    private mounted(): void {
        // Scroll to the middle of the editor
        this.container = this.$refs["canvas-container"] as HTMLDivElement;
        this.container.scrollTop = (this.$store.getters.canvasHeight - this.container.clientHeight) / 2;
        this.container.scrollLeft = (this.$store.getters.canvasWidth - this.container.clientWidth) / 2;
    }
}
</script>

<style lang="scss" scoped>
@import "../styles/colors";

#editor {
    display: flex;
}

#canvas-container {
    overflow: scroll;
}

::-webkit-scrollbar {
    height: 10px;
    width: 10px;
    background: #EEEEEE;
}

::-webkit-scrollbar-thumb {
    background: #DDDDDD;
    border-radius: 5px;
}

#canvas {
    display: flex;
    justify-content: center;
    align-items: center;
    background: $color-secondary;
}
</style>
