/* tslint:disable */
<template>
<div>
    <canvas></canvas>
    <roadmap></roadmap>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import Vue from "vue";
import Component from "vue-class-component";
import Canvas from "./Canvas.vue";
import Roadmap from "./Roadmap.vue";

@Component({
    components: {
        Canvas,
        Roadmap
    }
})
export default class Workspace extends Vue {}
/* tslint:disable */
</script>

<style lang="sass" scoped>

</style>
