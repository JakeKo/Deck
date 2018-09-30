/* tslint:disable */
<template>
<transition name="slide-preview">
    <div id="slide-preview" :style="style" @click="$store.commit('setActiveSlide', id)"></div>
</transition>
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

    get style(): any {
        return {
            border: `1px solid ${this.active ? this.$store.getters.theme.information : this.$store.getters.theme.tertiary}`
        };
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
