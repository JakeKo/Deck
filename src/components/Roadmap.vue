/* tslint:disable */
<template>
<div id="roadmap" :style="roadmapStyle">
    <div class="stretcher-vertical top" @mousedown="startStretch"></div>
    <div id="slide-previews">
        <slide-preview
            v-for="(slide) in $store.state.slides"
            :active="$store.getters.activeSlide.id === slide.id"
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

@Component({
    components: {
        SlidePreview
    }
})
export default class Roadmap extends Vue {
    private height: number = this.$store.getters.roadmapHeight;

    get roadmapStyle(): any {
        return {
            height: `${this.height}px`,
            borderTop: `1px solid ${this.$store.getters.theme.tertiary}`
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
        document.addEventListener("mousemove", this.previewStretch);
        document.addEventListener("mouseup", this.endStretch);
    }

    private previewStretch(event: any): void {
        this.height = window.innerHeight - event.pageY;
    }

    private endStretch(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.$store.commit("setRoadmapHeight", this.height);
        document.removeEventListener("mousemove", this.previewStretch);
        document.removeEventListener("mouseup", this.endStretch);
    }

    private newSlideHandler(event: Event): void {
        this.$store.commit("addSlideAfterSlideWithId", this.$store.getters.lastSlide.id);
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
@import "../styles/components";

#roadmap {
    flex-shrink: 0;
    overflow-x: scroll;
    position: relative;
    max-height: 256px;
}

#slide-previews {
    height: 100%;
    display: flex;
    align-items: center;
    position: absolute;
    padding: 0 12px;
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
