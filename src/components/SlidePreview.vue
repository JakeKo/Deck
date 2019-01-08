<template>
<div :id="`slide-preview_${id}`" :class="{ 'slide-preview': true, 'active-slide-preview': isActive }" @click="onSlidePreviewClicked"></div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";
import GraphicModel from "../models/GraphicModel";
import Utilities from "../utilities/general";
import * as SVG from "svg.js";

@Component
export default class SlidePreview extends Vue {
    private canvas!: SVG.Doc;
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Prop({ type: Array, required: true }) private graphics!: GraphicModel[];

    // Re-render the canvas any time a graphic is created, removed, or modified
    @Watch("graphics", { deep: true }) private refreshCanvas(): void {
        this.canvas.clear();
        this.graphics.forEach((graphic: GraphicModel) => Utilities.renderGraphic(graphic, this.canvas));
    }

    // Instantiate the svg.js API on the slide preview and perform the initial render
    private mounted(): void {
        // Infer the height of the slide preview from other slide previews if possible
        const slidePreview: HTMLDivElement = document.getElementsByClassName("slide-preview")[0] as HTMLDivElement;
        if (slidePreview !== undefined) {
            document.getElementById(`slide-preview_${this.id}`)!.style.height = slidePreview.style.height;
            document.getElementById(`slide-preview_${this.id}`)!.style.width = slidePreview.style.width;
        }

        const canvasResolution: number = this.$store.getters.canvasResolution;
        this.canvas = SVG(this.$el.id).viewbox(0, 0, canvasResolution * 1072, canvasResolution * 603);
        this.refreshCanvas();
    }

    private onSlidePreviewClicked(): void {
        this.$store.commit("activeSlide", this.id);
        this.$store.commit("focusGraphic", undefined);
        this.$store.commit("styleEditorObject", undefined);
    }
}
</script>

<style lang="scss" scoped>
@import "../styles/application";

// SVG canvas binding and styling breaks if active-slide-preview is an id
.active-slide-preview {
    border: 2px solid $color-information !important;
}

svg {
    width: 100%;
    height: 100%;
}
</style>
