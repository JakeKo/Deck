/* tslint:disable */
<template>
<div id="roadmap" :style="{ height: `${height}px`, borderTop: `1px solid ${$store.getters.theme.tertiary}` }">
    <div id="zone" @mousedown="bindResize"></div>
    <div id="slide-previews">
        <slide-preview
            v-for="(slide, index) in $store.state.slides"
            :active="$store.getters.activeSlide.id === slide.id"
            :id="slide.id"
            :key="index">
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

    get newSlideButtonStyle(): any {
        return {
            border: `1px solid ${this.$store.getters.theme.tertiary}`,
            color: this.$store.getters.theme.tertiary,
            background: this.$store.getters.theme.primary
        };
    }

    private bindResize(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        document.addEventListener("mousemove", this.mouseMoveHandler);
        document.addEventListener("mouseup", this.unbindResize);
    }

    private unbindResize(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.$store.commit("setRoadmapHeight", this.height);
        document.removeEventListener("mousemove", this.mouseMoveHandler);
        document.removeEventListener("mouseup", this.unbindResize);
    }

    private mouseMoveHandler(event: any): void {
        // Event is any type because pageY is not defined on Event
        this.height = window.innerHeight - event.pageY;
    }

    private newSlideHandler(event: Event): void {
        this.$store.commit("addSlideAfterSlideWithId", this.$store.getters.lastSlide.id);
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
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

#zone {
    position: absolute;
    width: 100%;
    height: 6px;
    transform: translateY(-50%);
    cursor: ns-resize;
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
