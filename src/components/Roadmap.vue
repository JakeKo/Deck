/* tslint:disable */
<template>
<div>
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

<style lang="sass" scoped>

</style>
