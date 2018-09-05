/* tslint:disable */
<template>
<div id="tool" @click="$emit('tool-click')">
    <div id="tool-icon" :style="{ background: $store.getters.theme.tertiary }"></div>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";

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
    border-radius: 50%;
}
</style>
