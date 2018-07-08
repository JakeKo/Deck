/* tslint:disable */
<template>
<div id="slide-preview">

</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";

@Component
export default class SlidePreview extends Vue {}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#slide-preview {
    border: 1px solid rgba(0, 0, 0, 0.15);
    height: 63px;
    width: 112px;
    margin-left: 24px;
}
</style>
