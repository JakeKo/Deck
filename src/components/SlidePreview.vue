<template>
<div :id="id" :class="{ 'slide-preview': true, 'active-slide-preview': isActive }">
    <div class="slide-preview-interface" @mousedown="focusSlide"></div>
    <div :id="`canvas_${id}`"></div>
</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import IGraphic from "../models/graphics/IGraphic";
import * as SVG from "svg.js";
import Point from "../models/Point";
import SlideWrapper from "../utilities/SlideWrapper";

@Component
export default class SlidePreview extends Vue {
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: String, required: true }) private slideId!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;

    private mounted(): void {
        // Infer the height of the slide preview from other slide previews if possible
        const slidePreview: HTMLElement = document.getElementsByClassName("slide-preview")[0] as HTMLElement;
        if (slidePreview !== undefined) {
            document.getElementById(this.id)!.style.height = slidePreview.style.height;
            document.getElementById(this.id)!.style.width = slidePreview.style.width;
        }

        // Instantiate the svg.js API on the slide preview and perform the initial render
        const canvasResolution: number = this.$store.getters.canvasResolution;
        const canvas: SVG.Doc = SVG(`canvas_${this.id}`).viewbox(0, 0, canvasResolution * 1072, canvasResolution * 603);
        new SlideWrapper(this.slideId, canvas, this.$store);
    }

    private focusSlide(event: MouseEvent): void {
        this.$store.commit("focusGraphic", { slideId: this.$store.getters.activeSlide.id, graphicId: undefined });
        this.$store.commit("activeSlide", this.id);
        this.$store.commit("styleEditorObject", undefined);

        const self: SlidePreview = this;
        const beginSlideReorder: number = window.setTimeout(reorderSlidePreview, 150);
        const slidePreview: HTMLElement = this.$el as HTMLElement;
        document.addEventListener("mouseup", interrupt);

        // Interrupt the slide reordering handlers if the mouse is lifted before the reordering begins
        function interrupt(event: MouseEvent): void {
            document.removeEventListener("mouseup", interrupt);
            window.clearTimeout(beginSlideReorder);
        }

        function reorderSlidePreview(): void {
            document.removeEventListener("mouseup", interrupt);

            // Determine the offset of the mouse relative to the slide preview (accounting for the horizontal margin)
            const bounds: ClientRect | DOMRect = slidePreview.getBoundingClientRect();
            const offset: Point = new Point(bounds.left - event.clientX - 12, bounds.top - event.clientY);

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
                slidePreview.style.top = "initial";
                slidePreview.style.left = "initial";

                const slidePreviews: Array<Element> = Array.from(document.getElementsByClassName("slide-preview"));
                const source: number = slidePreviews.findIndex((s: Element): boolean => s === slidePreview);

                // Get the horiontal midpoint of each slide preview to divide the slide reordering regions
                const displacements: Array<number> = slidePreviews.slice(0, slidePreviews.length - 1)
                    .filter((slidePreview: Element): boolean => slidePreview.id !== self.id)
                    .map((slidePreview: Element, index: number): number => {
                        const bounds: ClientRect | DOMRect = slidePreview.getBoundingClientRect();
                        return bounds.left + bounds.width / 2 - (index >= source ? 124 : 0);
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

.slide-preview-interface {
    height: 100%;
    width: 100%;
    position: absolute;
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
