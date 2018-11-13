/* tslint:disable */
<template>
<div id="roadmap" :style="roadmapStyle">
    <div class="stretcher-vertical top" :style="stretcherStyle" @mousedown="startStretch"></div>
    <div id="slide-previews">
        <slide-preview
            v-for="(slide) in $store.state.slides"
            :id="slide.id"
            :key="slide.id">
        </slide-preview>
        <div id="new-slide-button" @click="newSlideHandler" :style="newSlideButtonStyle">+</div>
    </div>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";
import SlidePreview from "./SlidePreview.vue";
import SlideModel from "../models/SlideModel";

@Component({
    components: {
        SlidePreview
    }
})
export default class Roadmap extends Vue {
    private height: number = this.$store.getters.roadmapHeight;
    private stretcherHeight: number = 6;

    get roadmapStyle(): any {
        return {
            height: `${this.height}px`,
            borderTop: `1px solid ${this.$store.getters.theme.tertiary}`
        };
    }

    get stretcherStyle(): any {
        return {
            height: `${this.stretcherHeight}px`
        };
    }

    get newSlideButtonStyle(): any {
        return {
            border: `1px solid ${this.$store.getters.theme.tertiary}`,
            color: this.$store.getters.theme.tertiary,
            background: this.$store.getters.theme.primary
        };
    }

    private startStretch(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget!.addEventListener("mousemove", this.previewStretch);
        event.currentTarget!.addEventListener("mouseup", this.endStretch);

        this.stretcherHeight = window.innerHeight * 2;
    }

    private previewStretch(event: any): void {
        event.preventDefault();
        event.stopPropagation();
        this.height = window.innerHeight - event.pageY;
    }

    private endStretch(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget!.removeEventListener("mousemove", this.previewStretch);
        event.currentTarget!.removeEventListener("mouseup", this.endStretch);

        this.stretcherHeight = 6;
        this.$store.commit("roadmapHeight", this.height);
    }

    private newSlideHandler(event: Event): void {
        this.$store.commit("addSlide", this.$store.getters.lastSlide.id);
        const slides: SlideModel[] = this.$store.getters.slides;
        const activeSlideIndex: number = slides.findIndex((slide: SlideModel) => slide.id === this.$store.getters.activeSlide.id);
        this.$store.commit("activeSlide", slides[activeSlideIndex + 1].id);
        this.$store.commit("styleEditorObject", undefined);
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
@import "../styles/components";

#roadmap {
    flex-shrink: 0;
    position: relative;
    max-height: 256px;
}

#slide-previews {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 12px;
    box-sizing: border-box;
    overflow-x: scroll;
}

::-webkit-scrollbar { 
    display: none; 
}

#new-slide-button {
    height: 63px;
    width: 112px;
    margin: 0 12px;
    cursor: pointer;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 48px;
}
</style>
