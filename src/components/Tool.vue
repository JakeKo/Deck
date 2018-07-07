/* tslint:disable */
<template>
<div id="tool">
    <div id="tool-icon"></div>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class Tool extends Vue {}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#tool {
    width: 100%;
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

#tool-icon {
    height: 36px;
    width: 36px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 50%;
}
</style>
