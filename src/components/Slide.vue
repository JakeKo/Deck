<template>
<div :id="`slide_${id}`" :class="{ 'slide': true, 'active-slide': isActive }"></div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import * as SVG from "svg.js";
import SlideWrapper from "../utilities/SlideWrapper";
import IGraphic from "../models/graphics/IGraphic";

@Component
export default class Slide extends Vue {
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Prop({ type: Array, required: true }) private graphics!: Array<IGraphic>;

    private mounted(): void {
        const canvasResolution: number = this.$store.getters.canvasResolution;
        const canvas: SVG.Doc = SVG(this.$el.id).viewbox(0, 0, canvasResolution * 1072, canvasResolution * 603);
        const slideWrapper: SlideWrapper = new SlideWrapper(this.id, canvas, this.$store);

        document.addEventListener("Deck.CanvasMouseOver", (event: Event): void => {
            if ((event as CustomEvent).detail.slideId === this.id) {
                this.$store.getters.tool.canvasMouseOver(slideWrapper)(event);
            }
        });

        document.addEventListener("Deck.CanvasMouseOut", (event: Event): void => {
            if ((event as CustomEvent).detail.slideId === this.id) {
                this.$store.getters.tool.canvasMouseOut(slideWrapper)(event);
            }
        });

        document.addEventListener("Deck.CanvasMouseDown", (event: Event): void => {
            if ((event as CustomEvent).detail.slideId === this.id) {
                this.$store.getters.tool.canvasMouseDown(slideWrapper)(event);
            }
        });

        document.addEventListener("Deck.GraphicMouseOver", (event: Event): void => {
            if ((event as CustomEvent).detail.slideId === this.id) {
                this.$store.getters.tool.graphicMouseOver(slideWrapper)(event);
            }
        });

        document.addEventListener("Deck.GraphicMouseOut", (event: Event): void => {
            if ((event as CustomEvent).detail.slideId === this.id) {
                this.$store.getters.tool.graphicMouseOut(slideWrapper)(event);
            }
        });

        document.addEventListener("Deck.GraphicMouseDown", (event: Event): void => {
            if ((event as CustomEvent).detail.slideId === this.id) {
                this.$store.getters.tool.graphicMouseDown(slideWrapper)(event);
            }
        });

        this.graphics.forEach((graphic: IGraphic): void => {
            slideWrapper.addGraphic(graphic);
        });
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
    overflow: hidden;
}

.active-slide {
    display: block !important;
}

svg {
    height: 100%;
    width: 100%;
}
</style>
