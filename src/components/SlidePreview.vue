/* tslint:disable */
<template>
<div id="slide-preview" :style="{ border: `1px solid ${this.active ? $store.getters.theme.information : $store.getters.theme.tertiary }` }" @click="$store.commit('setActiveSlide', id)"></div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class SlidePreview extends Vue {
    @Prop({ type: String, default: ""})
    public id?: string;

    @Prop({ type: Boolean, default: false })
    public active?: boolean;
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#slide-preview {
    height: 63px;
    width: 112px;
    margin: 0 12px;
    cursor: pointer;
    flex-shrink: 0;
}
</style>
