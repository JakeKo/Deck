<template>
<div class="slide-preview-container">
    <!-- <div class="slide-reordering-hook"></div> -->
    <div :id="`slide-preview_${id}`" :class="{ 'slide-preview': true, 'active-slide-preview': isActive }" @mousedown="focusSlide"></div>
</div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";
import IGraphic from "../models/IGraphic";
import * as SVG from "svg.js";
import Point from "../models/Point";

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

    // Instantiate the svg.js API on the slide preview and perform the initial render
    private mounted(): void {
        // Infer the height of the slide preview from other slide previews if possible
        const slidePreview: HTMLDivElement = document.getElementsByClassName("slide-preview")[0] as HTMLDivElement;
        if (slidePreview !== undefined) {
            document.getElementById(`slide-preview_${this.id}`)!.style.height = slidePreview.style.height;
            document.getElementById(`slide-preview_${this.id}`)!.style.width = slidePreview.style.width;
        }

        const canvasResolution: number = this.$store.getters.canvasResolution;
        this.canvas = SVG(`slide-preview_${this.id}`).viewbox(0, 0, canvasResolution * 1072, canvasResolution * 603);
        this.refreshCanvas();
    }

    private focusSlide(event: MouseEvent): void {
        this.$store.commit("activeSlide", this.id);
        this.$store.commit("focusGraphic", undefined);
        this.$store.commit("styleEditorObject", undefined);

        const slidePreview: HTMLElement = document.getElementById(`slide-preview_${this.id}`)!;
        const slideInteractionInterval: number = window.setTimeout(reorderSlidePreview, 150);
        slidePreview.addEventListener("mouseup", interrupt);
        const self = this;

        function interrupt(): void {
            window.clearTimeout(slideInteractionInterval);
            slidePreview.removeEventListener("mouseup", interrupt);
        }

        function reorderSlidePreview(): void {
            // Determine the offset of the mouse relative to the slide preview (accounting for the horizontal margin)
            const bounds: DOMRect = slidePreview.getBoundingClientRect() as DOMRect;
            const offset: Point = new Point(bounds.x - event.clientX - 12, bounds.y - event.clientY);

            document.addEventListener("mousemove", moveSlidePreview);
            document.addEventListener("mouseup", placeSlidePreview);

            slidePreview.style.position = "fixed";
            slidePreview.style.left = `${event.clientX + offset.x}px`;
            slidePreview.style.top = `${event.clientY + offset.y}px`;

            function moveSlidePreview(event: MouseEvent): void {
                event.stopPropagation();
                event.preventDefault();

                slidePreview.style.left = `${event.clientX + offset.x}px`;
                slidePreview.style.top = `${event.clientY + offset.y}px`;
            }

            function placeSlidePreview(event: MouseEvent): void {
                document.removeEventListener("mousemove", moveSlidePreview);
                document.removeEventListener("mouseup", placeSlidePreview);

                slidePreview.style.position = "relative";
                slidePreview.style.top = "0";
                slidePreview.style.left = "0";

                const slidePreviews: Array<Element> = Array.from(document.getElementsByClassName("slide-preview"));
                const source: number = slidePreviews.findIndex((s: Element): boolean => s === slidePreview);
                const slidePreviewWidth: number = 124;

                // Get the horiontal midpoint of each slide preview to divide the slide reordering regions
                const displacements: Array<number> = slidePreviews.slice(0, slidePreviews.length - 1)
                    .filter((slidePreview: Element): boolean => slidePreview.id !== `slide-preview_${self.id}`)
                    .map((slidePreview: Element, index: number): number => {
                        const bounds: DOMRect = slidePreview.getBoundingClientRect() as DOMRect;
                        return bounds.x + bounds.width / 2 - (index >= source ? slidePreviewWidth : 0);
                    }).sort();

                // Evaluate the slide destination as the region where the mouse is
                let destination: number = 0;
                for (const displacement of displacements) {
                    destination += event.clientX > displacement ? 1 : 0;
                }

                self.$store.commit("reorderSlide", { source, destination });
            }
        }
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
