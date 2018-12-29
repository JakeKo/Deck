<template>
<div id="roadmap" :style="roadmapStyle">
    <div class="stretcher-vertical top" @mousedown="stretch"></div>
    <div id="slide-previews">
        <slide-preview v-for="slide in $store.getters.slides"
            :id="slide.id"
            :graphics="$store.getters.slides.find((s) => s.id === slide.id).graphics"
            :key="slide.id"
        ></slide-preview>
        <div id="new-slide-button" @click="newSlideHandler" :style="newSlideButtonStyle">
            <i class="fas fa-plus"></i>
        </div>
    </div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import SlidePreview from "./SlidePreview.vue";
import SlideModel from "../models/SlideModel";

@Component({
    components: {
        SlidePreview
    }
})
export default class Roadmap extends Vue {
    get roadmapStyle(): any {
        return {
            height: `${this.$store.getters.roadmapHeight}px`,
            borderTop: `1px solid ${this.$store.getters.theme.tertiary}`
        };
    }

    get newSlideButtonStyle(): any {
        return {
            border: `2px solid ${this.$store.getters.theme.tertiary}`,
            color: this.$store.getters.theme.tertiary,
            background: this.$store.getters.theme.primary,
            height: `${this.$store.getters.slidePreviewHeight}px`,
            width: `${this.$store.getters.slidePreviewHeight * 16 / 9}px`
        };
    }

    private stretch(event: MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();
        document.addEventListener("mousemove", preview);
        document.addEventListener("mouseup", end);

        const self = this;
        function preview(event: MouseEvent): void {
            self.$store.commit("roadmapHeight", window.innerHeight - event.pageY);
        }

        function end(): void {
            document.removeEventListener("mousemove", preview);
            document.removeEventListener("mouseup", end);
        }
    }

    private newSlideHandler(event: Event): void {
        this.$store.commit("addSlide", this.$store.getters.slides.length);
        this.$store.commit("activeSlide", this.$store.getters.lastSlide.id);
        this.$store.commit("focusGraphic", undefined);
        this.$store.commit("styleEditorObject", undefined);
    }
}
</script>

<style lang="scss" scoped>
@import "../styles/application";

#roadmap {
    position: relative;
    box-sizing: border-box;
}

#slide-previews {
    height: 100%;
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
    margin: 0 24px 0 12px;
    cursor: pointer;
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
}
</style>
