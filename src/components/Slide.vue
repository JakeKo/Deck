<template>
<div :id="`slide_${id}`" :class="{ 'slide': true, 'active-slide': isActive }">
    <div class="slide-box"></div>
</div>
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
        const viewbox: { x: number, y: number, width: number, height: number } = this.$store.getters.rawViewbox;
        const canvas: SVG.Doc = SVG(this.$el.id).viewbox(viewbox.x, viewbox.y, viewbox.width, viewbox.height).style({ position: "absolute", top: 0, left: 0 });
        const slideWrapper: SlideWrapper = new SlideWrapper(this.id, canvas, this.$store, true);

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
    display: none;
    height: 100%;
    width: 100%;
    overflow: hidden;
    justify-content: center;
    align-items: center;
    position: relative;
}

.slide-box {
    box-shadow: 0 0 4px 0 $color-tertiary;
    background: $color-primary;
    height: calc(100% / 3);
    width: calc(100% / 3);
}

.active-slide {
    display: flex !important;
}
</style>
