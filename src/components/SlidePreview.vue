/* tslint:disable */
<template>
<transition name="slide-preview">
    <div id="slide-preview" :style="style" @click="onSlidePreviewClicked"></div>
</transition>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class SlidePreview extends Vue {
    @Prop({ type: String, default: ""})
    public id?: string;

    get style(): any {
        const isActive = this.id === this.$store.getters.activeSlide.id;
        return {
            border: `2px solid ${isActive ? this.$store.getters.theme.information : this.$store.getters.theme.tertiary}`
        };
    }

    private onSlidePreviewClicked(): void {
        this.$store.commit("activeSlide", this.id);
        this.$store.commit("styleEditorObject", undefined);
    }
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
