/* tslint:disable */
<template>
<div id="roadmap">
    <slide-preview></slide-preview>
    <slide-preview></slide-preview>
    <slide-preview></slide-preview>
    <slide-preview></slide-preview>
    <slide-preview></slide-preview>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import Vue from "vue";
import Component from "vue-class-component";
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