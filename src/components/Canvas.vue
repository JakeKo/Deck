/* tslint:disable */
<template>
<div>
    <slide></slide>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import Vue from "vue";
import Component from "vue-class-component";
import Slide from "./Slide.vue";

@Component({
    components: {
        Slide
    }
})
export default class Canvas extends Vue {}
/* tslint:disable */
</script>

<style lang="sass" scoped>

</style>
