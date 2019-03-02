<template>
<div class="slide-preview-container">
    <div class="slide-preview-slot"></div>
    <div :id="`slide-preview_${id}`" :class="{ 'slide-preview': true, 'active-slide-preview': isActive }">
        <div :id="`canvas_${id}`" class="slide-preview-canvas"></div>
        <div class="slide-preview-interface" @mousedown="focusSlide"></div>
    </div>
</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import * as SVG from "svg.js";
import Point from "../models/Point";
import SlideWrapper from "../utilities/SlideWrapper";
import IGraphic from "../models/graphics/IGraphic";
import Slide from "../models/Slide";

@Component
export default class SlidePreview extends Vue {
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: String, required: true }) private slideId!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Prop({ type: Array, required: true }) private graphics!: Array<IGraphic>;

    private mounted(): void {
        // Set the aspect ratio of the slide preview
        const slidePreview: HTMLElement = document.querySelector<HTMLElement>(`#slide-preview_${this.id}`)!;
        slidePreview.style.width = `${slidePreview.clientHeight * 16 / 9}px`;

        // Instantiate the svg.js API on the slide preview and perform the initial render
        const canvasResolution: number = this.$store.getters.canvasResolution;
        const canvas: SVG.Doc = SVG(`canvas_${this.id}`).viewbox(0, 0, canvasResolution * 1072, canvasResolution * 603);
        const slideWrapper: SlideWrapper = new SlideWrapper(this.slideId, canvas, this.$store);

        this.graphics.forEach((graphic: IGraphic): void => {
            slideWrapper.addGraphic(graphic);
        });
    }

    private focusSlide(event: MouseEvent): void {
        this.$store.commit("focusGraphic", { slideId: this.$store.getters.activeSlide.id, graphicId: undefined });
        this.$store.commit("activeSlide", this.id);
        this.$store.commit("styleEditorObject", undefined);

        const self: SlidePreview = this;
        const beginSlideReorder: number = window.setTimeout(reorderSlidePreview, 150);
        const slidePreview: HTMLElement = this.$el as HTMLElement;
        const slides: Array<Slide> = self.$store.getters.slides;
        const sourceIndex: number = slides.findIndex((slide: Slide): boolean => slide.id === self.slideId);
        document.addEventListener("mouseup", interrupt);

        // Interrupt the slide reordering handlers if the mouse is lifted before the reordering begins
        function interrupt(): void {
            document.removeEventListener("mouseup", interrupt);
            window.clearTimeout(beginSlideReorder);
        }

        function reorderSlidePreview(): void {
            // Determine the offset of the mouse relative to the slide preview
            const bounds: DOMRect = slidePreview.getBoundingClientRect() as DOMRect;
            const offset: Point = new Point(bounds.left - event.clientX, bounds.top - event.clientY);

            document.addEventListener("mousemove", moveSlidePreview);
            document.addEventListener("mouseup", placeSlidePreview);

            // Note: height must be set before changing the position
            slidePreview.id = "reordering-slide";
            slidePreview.style.height = `${slidePreview.clientHeight}px`;
            slidePreview.style.position = "fixed";
            slidePreview.style.left = `${event.clientX + offset.x}px`;
            slidePreview.style.top = `${event.clientY + offset.y}px`;
            slidePreview.style.zIndex = "1";

            const slidePreviews: Array<HTMLElement> = Array.from(document.querySelectorAll<HTMLElement>(".slide-preview-container:not([id*='reordering-slide'])"));
            const slidePreviewSlots: Array<HTMLElement> = Array.from(document.querySelectorAll<HTMLElement>(".slide-preview-slot"));
            function moveSlidePreview(event: MouseEvent): void {
                event.stopPropagation();
                event.preventDefault();

                slidePreview.style.left = `${event.clientX + offset.x}px`;
                slidePreview.style.top = `${event.clientY + offset.y}px`;

                const destinationIndex: number = getDestinationIndex(event.clientX, slidePreviews);
                const slidePreviewToMove: HTMLElement | undefined = slidePreviews[destinationIndex];
                slidePreviewSlots.forEach((slot: HTMLElement): void => void (slot.id = ""));

                if (slidePreviewToMove !== undefined) {
                    slidePreviewToMove.querySelector<HTMLElement>(".slide-preview-slot")!.id = "active-slide-preview-slot";
                }
            }

            function placeSlidePreview(event: MouseEvent): void {
                document.removeEventListener("mousemove", moveSlidePreview);
                document.removeEventListener("mouseup", placeSlidePreview);

                const destinationIndex: number = getDestinationIndex(event.clientX, slidePreviews);
                slidePreviewSlots.forEach((slot: HTMLElement): void => void (slot.id = ""));

                // Note: replacing the styling must come after fetching the destination index
                slidePreview.id = "";
                slidePreview.style.position = "relative";
                slidePreview.style.top = null;
                slidePreview.style.left = null;
                slidePreview.style.height = "100%";
                slidePreview.style.zIndex = null;

                self.$store.commit("reorderSlide", { source: sourceIndex, destination: destinationIndex });
            }
        }

        // Returns the potential destination index of a slide if the reordering were to complete
        // Calculates based on mouse position relative to centers of each slide preview
        function getDestinationIndex(position: number, slidePreviews: Array<HTMLElement>): number {
            const boundsList: Array<DOMRect> = slidePreviews.map<DOMRect>((slidePreview: HTMLElement): DOMRect => slidePreview.getBoundingClientRect() as DOMRect);
            const borders: Array<number> = boundsList.map<number>((bounds: DOMRect): number => bounds.x + bounds.width / 2);

            for (let i = 0; i < borders.length; i++) {
                if (position < borders[i]) {
                    return i;
                }
            }

            return borders.length;
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../styles/application";

.slide-preview-container {
    height: 100%;
    display: flex;
}

.slide-preview-slot {
    height: 100%;
    width: 2px;
}

#active-slide-preview-slot {
    background: $color-information;
}

.slide-preview {
    margin: 0 12px;
    cursor: pointer;
    flex-shrink: 0;
    border: 2px solid $color-tertiary;
    height: 100%;
    background: $color-light;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;

    &:hover {
        border: 2px solid $color-success;
    }
}

.slide-preview-canvas {
    width: 100%;
    height: 100%;
    position: absolute;
    background: $color-light;
}

.slide-preview-interface {
    height: 100%;
    width: 100%;
    position: absolute;
}

// SVG canvas binding and styling breaks if active-slide-preview is an id
.active-slide-preview {
    border: 2px solid $color-information !important;
}
</style>
