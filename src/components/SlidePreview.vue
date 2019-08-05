<template>
<div class="slide-preview-container" :data-index="index">
    <div ref="slide-preview-slot" class="slide-preview-slot inactive-slide-preview-slot" :data-index="index"></div>
    <div class="slide-preview-content">
        <input v-if="!isAddSlide" ref="topic-label" :class="{ 'topic-label': true, 'ephemeral-label': topicLabel === '' }" v-model="topicLabel" @keydown="handleKeydown" placeholder="Add Topic">
        <div ref="slide-preview" :id="`slide-preview_${id}`" :class="{ 'slide-preview': true, 'active-slide-preview': isActive, 'add-slide': isAddSlide }">
            <div v-if="!isAddSlide" :id="`canvas_${id}`" class="slide-preview-canvas"></div>
            <div class="slide-preview-interface" @mousedown="focusSlide"></div>
            <div v-if="isAddSlide" class="add-slide-icon">
                <i class="fas fa-plus"></i>
            </div>
        </div>
    </div>
</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import * as SVG from "svg.js";
import Vector from "../models/Vector";
import SlideWrapper from "../models/SlideWrapper";
import { IGraphic, ISlideWrapper } from "../types";
import Slide from "../models/Slide";

@Component
export default class SlidePreview extends Vue {
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: Number, required: true }) private index!: number;
    @Prop({ type: String, required: true }) private slideId!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Prop({ type: Array, required: true }) private graphics!: Array<IGraphic>;
    @Prop({ type: Boolean, required: true }) private isAddSlide!: boolean;
    @Prop({ type: String, required: true }) private topic!: string;

    get topicLabel(): string {
        return this.topic;
    }

    set topicLabel(value: string) {
        this.$store.commit("setTopic", { index: this.index, topic: value });
    }

    private handleKeydown(event: KeyboardEvent): void {
        // Prevent propagation so pressing "Delete" or "Backspace" won't remove graphics from the active slide
        // TODO: Devise better way to handle removing graphics such that graphics are only removed if a delete-ish key is pressed while the editor is "focused"
        event.stopPropagation();

        // Submit the input field if "Enter" is pressed
        if (["Tab", "Enter"].indexOf(event.key) !== -1) {
            (event.target as HTMLInputElement).blur();
        }
    }

    private mounted(): void {
        // Set the aspect ratio of the slide preview
        const slidePreview: HTMLElement = this.$refs["slide-preview"] as HTMLElement;
        const slidePreviewSlot: HTMLElement = this.$refs["slide-preview-slot"] as HTMLElement;
        slidePreview.style.width = slidePreviewSlot.style.width = `${slidePreview.clientHeight * 16 / 9}px`;

        if (this.isAddSlide) {
            return;
        }

        const topicLabel: HTMLInputElement = this.$refs["topic-label"] as HTMLInputElement;
        topicLabel.style.width = `${slidePreview.clientHeight * 16 / 9}px`;

        // Instantiate the svg.js API on the slide preview and perform the initial render
        const viewbox: { x: number, y: number, width: number, height: number } = this.$store.getters.croppedViewbox;
        const canvas: SVG.Doc = SVG(`canvas_${this.id}`).viewbox(viewbox.x, viewbox.y, viewbox.width, viewbox.height);
        const slideWrapper: ISlideWrapper = new SlideWrapper(this.slideId, canvas, this.$store, false);
        this.graphics.forEach((graphic: IGraphic): void => slideWrapper.addGraphic(graphic));
    }

    private focusSlide(event: MouseEvent): void {
        // NOTE: This is pretty bad. Please fix this I beg you.
        if (this.isAddSlide) {
            this.$emit("add-slide");
            return;
        }

        this.$store.commit("focusGraphic", { slideId: this.$store.getters.activeSlide.id, graphicId: undefined });
        this.$store.commit("activeSlide", this.id);
        this.$store.commit("graphicEditorGraphicId", undefined);

        // Calculate the dividing boundaries between slides - used to determine the destination index of the slide-to-reorder
        const slidePreview: HTMLElement = this.$el as HTMLElement;
        const slidePreviewBounds: Array<DOMRect> = Array.from(document.querySelectorAll<HTMLElement>(".slide-preview-container"))
            .map<DOMRect>((element: HTMLElement): DOMRect => element.getBoundingClientRect() as DOMRect);
        const [ first, second, ..._ ]: Array<DOMRect> = slidePreviewBounds;
        const boundaryOffset: number = (first.x + first.width + second.x) / 2 - first.x;
        const boundaries: Array<number> = slidePreviewBounds.map<number>((bounds: DOMRect): number => bounds.x + boundaryOffset).slice(0, -1);

        document.addEventListener("mousemove", moveSlidePreview);
        document.addEventListener("mouseup", placeSlidePreview);

        const bounds: DOMRect = slidePreview.getBoundingClientRect() as DOMRect;
        const offset: Vector = new Vector(bounds.left - event.clientX, bounds.top - event.clientY);

        // Note: height and offset must be set before changing the position
        slidePreview.style.height = `${slidePreview.clientHeight}px`;
        slidePreview.style.position = "fixed";
        slidePreview.style.zIndex = "1";

        const slidePreviews: Array<HTMLElement> = Array.from(document.querySelectorAll<HTMLElement>(`.slide-preview-container:not([data-index="${this.index}"])`));
        const slidePreviewSlots: Array<HTMLElement> = slidePreviews.map<HTMLElement>((element: HTMLElement): HTMLElement => element.querySelector<HTMLElement>(".slide-preview-slot")!);
        moveSlidePreview(event);

        function moveSlidePreview(event: MouseEvent): void {
            slidePreview.style.left = `${event.clientX + offset.x}px`;
            slidePreview.style.top = `${event.clientY + offset.y}px`;

            const destinationIndex: number = getDestinationIndex(event.clientX + offset.x + bounds.width / 2, boundaries);
            slidePreviewSlots.forEach((slot: HTMLElement): void => slot.classList.add("inactive-slide-preview-slot"));
            slidePreviews[destinationIndex].querySelector<HTMLElement>(".slide-preview-slot")!.classList.remove("inactive-slide-preview-slot");
        }

        const self: SlidePreview = this;
        function placeSlidePreview(event: MouseEvent): void {
            document.removeEventListener("mousemove", moveSlidePreview);
            document.removeEventListener("mouseup", placeSlidePreview);

            slidePreviewSlots.forEach((slot: HTMLElement): void => slot.classList.add("inactive-slide-preview-slot"));

            // Note: replacing the styling must come after fetching the destination index
            slidePreview.style.position = "relative";
            slidePreview.style.top = null;
            slidePreview.style.left = null;
            slidePreview.style.height = "100%";
            slidePreview.style.zIndex = null;

            const destination: number = getDestinationIndex(event.clientX + offset.x + bounds.width / 2, boundaries);
            self.$store.commit("reorderSlide", { source: self.index, destination: destination });
        }

        function getDestinationIndex(position: number, boundaries: Array<number>) {
            for (let i = 0; i < boundaries.length; i++) {
                if (position < boundaries[i]) {
                    return i;
                }
            }

            return boundaries.length - 1;
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../styles/application";

.add-slide-icon {
    color: $color-tertiary;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
}

.slide-preview-container {
    height: 100%;
    display: flex;
}

.slide-preview-slot {
    height: 100%;
    background: $color-tertiary;
    margin: 18px 8px 0 8px;
    border-radius: 4px;
    border: 2px solid $color-tertiary;
    box-sizing: border-box;
}

.slide-preview-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.topic-label {
    font-family: $font-body;
    font-size: 14px;
    text-align: center;
    border: none;
    outline: none;
    background: transparent;
    height: 16px;
}

.ephemeral-label {
    opacity: 0;

    &:hover {
        opacity: 1;
    }
}

.inactive-slide-preview-slot {
    width: 0 !important;
    margin: 0;
    border: 0;
}

.slide-preview {
    margin: 0 8px;
    cursor: pointer;
    flex-shrink: 0;
    border: 2px solid $color-tertiary;
    border-radius: 4px;
    height: calc(100% - 18px);
    background: $color-light;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    transition: border-color 0.15s;

    &:hover {
        border-color: rgba(0, 0, 0, 0.35);
    }
}

.add-slide {
    border-style: dashed;
    margin-top: 18px;
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
