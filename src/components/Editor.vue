/* tslint:disable */
<template>
<div id="editor">
    <div id="canvas" :style="canvasStyle">
        <slide v-for="slide in $store.getters.slides" 
            :key="slide.id"
            :id="slide.id"
            :graphics="slide.graphics"
        ></slide>
    </div>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Watch } from "vue-property-decorator";
import Slide from "./Slide.vue";

@Component({
    components: {
        Slide
    }
})
export default class Editor extends Vue {
    @Watch("canvasZoom")
    private onCanvasZoomChanged(): void {
        const percentageDown = this.$el.scrollTop / this.$el.scrollHeight;
        const percentageOver = this.$el.scrollLeft / this.$el.scrollWidth;
        document.getElementById("canvas")!.style.zoom = this.$store.getters.canvasZoom;
        this.$el.scrollTop = this.$el.scrollHeight * percentageDown;
        this.$el.scrollLeft = this.$el.scrollWidth * percentageOver;
    }

    get canvasZoom(): number {
        return this.$store.getters.canvasZoom;
    }

    get canvasStyle(): any {
        return {
            width: `${this.$store.getters.canvasWidth}px`,
            height: `${this.$store.getters.canvasHeight}px`,
            background: this.$store.getters.theme.secondary
        };
    }

    public mounted(): void {
        this.$el.scrollTop = (this.$store.getters.canvasHeight - this.$el.clientHeight) / 2;
        this.$el.scrollLeft = (this.$store.getters.canvasWidth - this.$el.clientWidth) / 2;
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#editor {
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
}
</style>
