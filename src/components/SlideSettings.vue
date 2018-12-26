<template>
<div id="slide-settings">
</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class SlideSettings extends Vue {

}
</script>

<style lang="scss" scoped>
@import "../styles/components";

#slide-settings {
    background: $color-light;
    border-right: 1px solid $color-tertiary;
    width: 32px;
    flex-shrink: 0;
    height: 100%;
}
</style>
