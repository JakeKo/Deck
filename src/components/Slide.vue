<template>
<div :id="`slide_${id}`" :class="{ 'slide': true, 'active-slide': isActive }">
    <div class="slide-box"></div>
</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import * as SVG from "svg.js";
import SlideWrapper from "../models/SlideWrapper";
import { IGraphic, CustomCanvasMouseEvent, ISlideWrapper } from "../types";

@Component
export default class Slide extends Vue {
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Prop({ type: Array, required: true }) private graphics!: Array<IGraphic>;

    private mounted(): void {
        const viewbox: { x: number, y: number, width: number, height: number } = this.$store.getters.rawViewbox;
        const canvas: SVG.Doc = SVG(this.$el.id).viewbox(viewbox.x, viewbox.y, viewbox.width, viewbox.height).style({ position: "absolute", top: 0, left: 0 });
        const slideWrapper: ISlideWrapper = new SlideWrapper(this.id, canvas, this.$store, true);

        document.addEventListener("Deck.CanvasMouseOver", ((event: CustomCanvasMouseEvent): void => {
            if (event.detail.slideId === this.id) {
                this.$store.getters.tool.canvasMouseOver(slideWrapper)(event);
            }
        }) as EventListener);

        document.addEventListener("Deck.CanvasMouseOut", ((event: CustomCanvasMouseEvent): void => {
            if (event.detail.slideId === this.id) {
                this.$store.getters.tool.canvasMouseOut(slideWrapper)(event);
            }
        }) as EventListener);

        document.addEventListener("Deck.CanvasMouseDown", ((event: CustomCanvasMouseEvent): void => {
            if (event.detail.slideId === this.id) {
                this.$store.getters.tool.canvasMouseDown(slideWrapper)(event);
            }
        }) as EventListener);

        document.addEventListener("Deck.GraphicMouseOver", ((event: CustomCanvasMouseEvent): void => {
            if (event.detail.slideId === this.id) {
                this.$store.getters.tool.graphicMouseOver(slideWrapper)(event);
            }
        }) as EventListener);

        document.addEventListener("Deck.GraphicMouseOut", ((event: CustomCanvasMouseEvent): void => {
            if (event.detail.slideId === this.id) {
                this.$store.getters.tool.graphicMouseOut(slideWrapper)(event);
            }
        }) as EventListener);

        document.addEventListener("Deck.GraphicMouseDown", ((event: CustomCanvasMouseEvent): void => {
            if (event.detail.slideId === this.id) {
                this.$store.getters.tool.graphicMouseDown(slideWrapper)(event);
            }
        }) as EventListener);

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
