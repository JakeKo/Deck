<template>
<div :id="`slide-preview_${id}`" :class="{ 'slide-preview': true, 'active-slide-preview': isActive }" @mousedown="focusSlide"></div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";
import GraphicModel from "../models/GraphicModel";
import Utilities from "../utilities/general";
import * as SVG from "svg.js";
import PointModel from "../models/PointModel";

@Component
export default class SlidePreview extends Vue {
    private canvas!: SVG.Doc;
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Prop({ type: Array, required: true }) private graphics!: GraphicModel[];

    // Re-render the canvas any time a graphic is created, removed, or modified
    @Watch("graphics", { deep: true }) private refreshCanvas(): void {
        this.canvas.clear();
        this.graphics.forEach((graphic: GraphicModel) => Utilities.renderGraphic(graphic, this.canvas));
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
        this.canvas = SVG(this.$el.id).viewbox(0, 0, canvasResolution * 1072, canvasResolution * 603);
        this.refreshCanvas();
    }

    private focusSlide(event: MouseEvent): void {
        this.$store.commit("activeSlide", this.id);
        this.$store.commit("focusGraphic", undefined);
        this.$store.commit("styleEditorObject", undefined);

        const slidePreview: HTMLElement = this.$el as HTMLElement;
        const slideInteractionInterval: number = window.setTimeout(reorderSlidePreview, 150);
        slidePreview.addEventListener("mouseup", interrupt);

        function interrupt(): void {
            window.clearTimeout(slideInteractionInterval);
            slidePreview.removeEventListener("mouseup", interrupt);
        }

        function reorderSlidePreview(): void {
            // Determine the offset of the mouse relative to the slide preview (accounting for the horizontal margin)
            const bounds: DOMRect = slidePreview.getBoundingClientRect() as DOMRect;
            const offset: PointModel = new PointModel(bounds.x - event.clientX - 12, bounds.y - event.clientY);

            slidePreview.style.position = "fixed";
            slidePreview.style.left = `${event.clientX + offset.x}px`;
            slidePreview.style.top = `${event.clientY + offset.y}px`;
            document.addEventListener("mousemove", moveSlidePreview);
            document.addEventListener("mouseup", placeSlidePreview);

            function moveSlidePreview(event: MouseEvent): void {
                event.stopPropagation();
                event.preventDefault();

                slidePreview.style.left = `${event.clientX + offset.x}px`;
                slidePreview.style.top = `${event.clientY + offset.y}px`;
            }

            function placeSlidePreview(): void {
                document.removeEventListener("mousemove", moveSlidePreview);
                document.removeEventListener("mouseup", placeSlidePreview);

                slidePreview.style.position = "relative";
                slidePreview.style.top = "0";
                slidePreview.style.left = "0";
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
