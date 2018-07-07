/* tslint:disable */
<template>
<div>
    <tool></tool>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import Vue from "vue";
import Component from "vue-class-component";
import Tool from "./Tool.vue";

@Component({
    components: {
        Tool
    }
})
export default class Toolbox extends Vue {}
/* tslint:disable */
</script>

<style lang="scss" scoped>

</style>
