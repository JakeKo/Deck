<template>
<div id="roadmap">
    <div class="stretcher-vertical top" @mousedown="stretch"></div>
    <div id="slide-previews">
        <slide-preview v-for="slide in $store.getters.slides"
            :id="slide.id"
            :slideId="slide.id"
            :isActive="$store.getters.activeSlide !== undefined && slide.id === $store.getters.activeSlide.id"
            :graphics="slide.graphics"
            :key="slide.id"
        ></slide-preview>
        <div id="new-slide-button" @click="addSlide">
            <i class="fas fa-plus"></i>
        </div>
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
    private mounted(): void {
        const newSlideButton: HTMLElement = this.$el.querySelector<HTMLElement>("#new-slide-button")!;
        newSlideButton.style.width = `${newSlideButton.clientHeight}px`;
    }

    private stretch(event: MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();
        document.addEventListener("mousemove", preview);
        document.addEventListener("mouseup", end);

        const self: Roadmap = this;
        const newSlideButton: HTMLElement = document.querySelector<HTMLElement>("#new-slide-button")!;
        function preview(event: MouseEvent): void {
            // Update the height of the roadmap
            const height: number = Math.max(Math.min(window.innerHeight - event.pageY, 256), 64);
            (self.$el as HTMLElement).style.height = `${height}px`;
            newSlideButton.style.width = `${newSlideButton.clientHeight}px`;

            // Resize the slide previews based on the height of the roadmap
            Array.from(document.querySelectorAll<HTMLElement>(".slide-preview")).forEach((slidePreview: HTMLElement): void => {
                slidePreview.style.width = `${slidePreview.clientHeight * 16 / 9}px`;
            });
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
    height: 96px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

#slide-previews {
    height: 60%;
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

#new-slide-button {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50%;
    background: $color-tertiary;
    color: $color-light;
    border-radius: 50%;
    cursor: pointer;
    margin: 0 12px;
    flex-shrink: 0;

    &:hover {
        background: $color-information;
    }
}
</style>
