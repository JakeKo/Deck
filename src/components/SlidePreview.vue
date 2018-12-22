<template>
<div :id="`slide-preview_${id}`" class="slide-preview" :style="slidePreviewStyle" @click="onSlidePreviewClicked"></div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";
import GraphicModel from "../models/GraphicModel";
import Utilities from "../utilities/miscellaneous";
import * as SVG from "svg.js";

@Component
export default class SlidePreview extends Vue {
    private canvas!: SVG.Doc;

    @Prop({ type: String, required: true })
    private id?: string;

    @Prop({ type: Array, default: () => new Array<GraphicModel>() })
    private graphics!: GraphicModel[];

    @Watch("graphics", { deep: true })
    private refreshCanvas(): void {
        this.canvas.clear();
        this.graphics.forEach((graphic: GraphicModel) => Utilities.renderGraphic(graphic, this.canvas));
    }

    get slidePreviewStyle(): any {
        const isActive: boolean = this.id === this.$store.getters.activeSlide.id;

        return {
            border: `2px solid ${isActive ? this.$store.getters.theme.information : this.$store.getters.theme.tertiary}`,
            height: `${this.$store.getters.slidePreviewHeight}px`,
            width: `${this.$store.getters.slidePreviewHeight * 16 / 9}px`
        };
    }

    private mounted(): void {
        const canvasResolution: number = this.$store.getters.canvasResolution;
        this.canvas = SVG(this.$el.id).viewbox(0, 0, canvasResolution * this.$store.getters.slideWidth, canvasResolution * this.$store.getters.slideHeight);
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
.slide-preview {
    margin: 0 12px;
    cursor: pointer;
    flex-shrink: 0;
}

svg {
    width: 100%;
    height: 100%;
}
</style>
