<template>
<div id="roadmap">
    <div class="stretcher-vertical top" @mousedown="stretch"></div>
    <div id="slide-previews">
        <slide-preview v-for="slide in $store.getters.slides"
            :id="slide.id"
            :slideId="slide.id"
            :isActive="$store.getters.activeSlide !== undefined && slide.id === $store.getters.activeSlide.id"
            :graphics="slide.graphics"
            :isAddSlide="false"
            :key="slide.id"
        ></slide-preview>
        <slide-preview :id="'addSlide'" :slideId="'-'" :isActive="false" :graphics="[]" :isAddSlide="true" @add-slide="addSlide"></slide-preview>
    </div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import SlidePreview from "./SlidePreview.vue";
import Slide from "../models/Slide";

@Component({
    components: {
        SlidePreview
    }
})
export default class Roadmap extends Vue {
    private stretch(event: MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();
        document.addEventListener("mousemove", preview);
        document.addEventListener("mouseup", end);

        const self: Roadmap = this;
        function preview(event: MouseEvent): void {
            // Update the height of the roadmap
            const height: number = Math.max(Math.min(window.innerHeight - event.pageY, 192), 64);
            (self.$el as HTMLElement).style.height = `${height}px`;

            // Resize the slide previews based on the height of the roadmap
            [
                ...Array.from(document.querySelectorAll<HTMLElement>(".slide-preview")),
                ...Array.from(document.querySelectorAll<HTMLElement>(".slide-preview-slot"))
            ].forEach((slidePreviewComponent: HTMLElement): void => void (slidePreviewComponent.style.width = `${slidePreviewComponent.clientHeight * 16 / 9}px`));
        }

        function end(): void {
            document.removeEventListener("mousemove", preview);
            document.removeEventListener("mouseup", end);
        }
    }

    private addSlide(): void {
        // If there is an active slide, unfocus any graphic(s) that may be focused
        if (this.$store.getters.activeSlide !== undefined) {
            this.$store.commit("focusGraphic", { slideId: this.$store.getters.activeSlide.id, graphicId: undefined });
        }

        this.$store.commit("addSlide", this.$store.getters.slides.length);
        this.$store.commit("activeSlide", this.$store.getters.slides[this.$store.getters.slides.length - 1].id);
        this.$store.commit("graphicEditorObject", undefined);
    }
}
</script>

<style lang="scss" scoped>
@import "../styles/application";

#roadmap {
    position: relative;
    box-sizing: border-box;
    border-top: 1px solid $color-tertiary;
    height: 64px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

#slide-previews {
    height: calc(100% - 24px);
    min-width: 100%;
    overflow-x: auto;
    display: flex;
    align-items: center;
    padding: 0 12px;
    box-sizing: border-box;
}

::-webkit-scrollbar {
    display: none;
}
</style>
