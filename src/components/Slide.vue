/* tslint:disable */
<template>
<div id="slide">
    <shape backgroundColor="pink"></shape>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import Vue from "vue";
import Component from "vue-class-component";
import Shape from "./Shape.vue";

@Component({
    components: {
        Shape
    }
})
export default class Slide extends Vue {}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#slide {
    height: 603px;
    width: 1072px;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.15);
    background: #FFF;
}
</style>
