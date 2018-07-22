/* tslint:disable */
<template>
<div id="slide-preview" :style="{ 'border': border }"></div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class SlidePreview extends Vue {
    @Prop({ type: Boolean, default: false })
    public active?: boolean;

    get border(): string {
        return `1px solid ${this.active ? "blue" : "rgba(0, 0, 0, 0.15)"}`;
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#slide-preview {
    height: 63px;
    width: 112px;
    margin-left: 24px;
    cursor: pointer;
}
</style>
