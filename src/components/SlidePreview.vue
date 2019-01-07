<template>
<div :id="`slide-preview_${id}`" :class="{ 'slide-preview': true, 'active-slide-preview': isActive }" :style="slidePreviewStyle" @click="onSlidePreviewClicked"></div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";
import IGraphic from "../models/IGraphic";
import * as SVG from "svg.js";

@Component
export default class SlidePreview extends Vue {
    private canvas!: SVG.Doc;
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Prop({ type: Array, required: true }) private graphics!: Array<IGraphic>;

    // Re-render the canvas any time a graphic is created, removed, or modified
    @Watch("graphics", { deep: true }) private refreshCanvas(): void {
        this.canvas.clear();
        this.graphics.forEach((graphic: IGraphic): SVG.Element => graphic.render(this.canvas));
    }

    get slidePreviewStyle(): any {
        return {
            height: `${this.$store.getters.slidePreviewHeight}px`,
            width: `${this.$store.getters.slidePreviewHeight * 16 / 9}px`
        };
    }

    // Instantiate the svg.js API on the slide preview and perform the initial render
    private mounted(): void {
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
@import "../styles/colors";

.slide-preview {
    margin: 0 12px;
    cursor: pointer;
    flex-shrink: 0;
    border: 2px solid $color-tertiary;
}

// SVG canvas binding and styling breaks if active-slide-preview is an id
.active-slide-preview {
    border: 2px solid $color-information !important;
}

svg {
    width: 100%;
    height: 100%;
}
</style>
