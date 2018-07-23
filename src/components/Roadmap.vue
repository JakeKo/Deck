/* tslint:disable */
<template>
<div id="roadmap">
    <slide-preview
        v-for="(slide, index) in $store.state.slides"
        :active="$store.getters.activeSlide.id === slide.id"
        :id="slide.id"
        :key="index">
    </slide-preview>
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
export default class Roadmap extends Vue {}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#roadmap {
    height: 96px;
    border-top: 1px solid rgba(0, 0, 0, 0.15);
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
</style>
