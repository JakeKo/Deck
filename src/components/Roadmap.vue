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
    padding: 0 12px;
    display: flex;
    align-items: center;
    min-width: 100%;
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
</style>
