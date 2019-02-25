<template>
<div id="menu-bar"></div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class MenuBar extends Vue { }
</script>

<style lang="scss" scoped>
@import "../styles/colors";

#menu-bar {
    height: 32px;
    flex-shrink: 0;
    box-sizing: border-box;
    border-bottom: 1px solid $color-tertiary;
}
</style>

