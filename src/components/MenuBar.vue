<template>
<div id="menu-bar">
IOU Menus
</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class MenuBar extends Vue {

}
</script>

<style lang="scss" scoped>
@import "../styles/application";

#menu-bar {
    background: $color-light;
    border-bottom: 1px solid $color-tertiary;
    height: 32px;
    flex-shrink: 0;
    color: $color-dark;
    font-family: $font-body;
    display: flex;
    align-items: center;
}
</style>
