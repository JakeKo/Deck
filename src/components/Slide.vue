<template>
<div :id="`slide_${id}`" :class="{ 'slide': true, 'active-slide': isActive }"></div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import * as SVG from "svg.js";
import IGraphic from "../models/IGraphic";
import SlideWrapper from "../utilities/SlideWrapper";

@Component
export default class Slide extends Vue {
    private canvas!: SVG.Doc;
    private slideWrapper!: SlideWrapper;
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Prop({ type: Array, required: true }) private graphics!: Array<IGraphic>;

    private mounted(): void {
        const canvasResolution: number = this.$store.getters.canvasResolution;
        this.canvas = SVG(this.$el.id).viewbox(0, 0, canvasResolution * 1072, canvasResolution * 603);
        this.slideWrapper = new SlideWrapper(this.id, this.canvas, this.$store);

        document.addEventListener("Deck.CanvasMouseOver", (event: Event): void => this.$store.getters.tool.canvasMouseOver(this.slideWrapper)(event));
        document.addEventListener("Deck.CanvasMouseOut", (event: Event): void => this.$store.getters.tool.canvasMouseOut(this.slideWrapper)(event));
        document.addEventListener("Deck.CanvasMouseDown", (event: Event): void => this.$store.getters.tool.canvasMouseDown(this.slideWrapper)(event));

        document.addEventListener("Deck.GraphicMouseOver", (event: Event): void => this.$store.getters.tool.graphicMouseOver(this.slideWrapper)(event));
        document.addEventListener("Deck.GraphicMouseOut", (event: Event): void => this.$store.getters.tool.graphicMouseOut(this.slideWrapper)(event));
        document.addEventListener("Deck.GraphicMouseDown", (event: Event): void => this.$store.getters.tool.graphicMouseDown(this.slideWrapper)(event));

        this.graphics.forEach((graphic: IGraphic): void => this.slideWrapper.addGraphic(graphic));
    }
}
</script>

<style lang="scss" scoped>
@import "../styles/colors";

.slide {
    box-shadow: 0 0 4px 0 $color-tertiary;
    background: $color-primary;
    display: none;
    height: 603px;
    width: 1072px;
}

.active-slide {
    display: block !important;
}

svg {
    height: 100%;
    width: 100%;
}
</style>
