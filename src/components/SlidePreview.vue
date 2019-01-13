<template>
<div :id="uid" :class="{ 'slide-preview': true, 'active-slide-preview': isActive }" @mousedown="focusSlide"></div>
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

    get uid(): string {
        return `slide-preview_${this.id}`;
    }

    private mounted(): void {
        // Infer the height of the slide preview from other slide previews if possible
        const slidePreview: HTMLElement = document.getElementsByClassName("slide-preview")[0] as HTMLElement;
        if (slidePreview !== undefined) {
            document.getElementById(this.uid)!.style.height = slidePreview.style.height;
            document.getElementById(this.uid)!.style.width = slidePreview.style.width;
        }

        // Instantiate the svg.js API on the slide preview and perform the initial render
        const canvasResolution: number = this.$store.getters.canvasResolution;
        this.canvas = SVG(this.uid).viewbox(0, 0, canvasResolution * 1072, canvasResolution * 603);
        this.refreshCanvas();
    }

    private focusSlide(event: MouseEvent): void {
        this.$store.commit("activeSlide", this.id);
        this.$store.commit("focusGraphic", undefined);
        this.$store.commit("styleEditorObject", undefined);

        const self = this;
        const beginSlideReorder: number = window.setTimeout(reorderSlidePreview, 150);
        const slidePreview: HTMLElement = this.$el as HTMLElement;
        slidePreview.addEventListener("mouseup", interrupt);

        // Interrupt the slide reordering handlers if the mouse is lifted before the reordering begins
        function interrupt(): void {
            window.clearTimeout(beginSlideReorder);
            slidePreview.removeEventListener("mouseup", interrupt);
        }

        function reorderSlidePreview(): void {
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
                slidePreview.style.top = "0";
                slidePreview.style.left = "0";

                const slidePreviews: Array<Element> = Array.from(document.getElementsByClassName("slide-preview"));
                const source: number = slidePreviews.findIndex((s: Element): boolean => s === slidePreview);

                // Get the horiontal midpoint of each slide preview to divide the slide reordering regions
                const displacements: Array<number> = slidePreviews.slice(0, slidePreviews.length - 1)
                    .filter((slidePreview: Element): boolean => slidePreview.id !== self.uid)
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

// SVG canvas binding and styling breaks if active-slide-preview is an id
.active-slide-preview {
    border: 2px solid $color-information !important;
}

svg {
    width: 100%;
    height: 100%;
}
</style>
