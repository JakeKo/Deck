/* tslint:disable */
<template>
<div id="shape" :style="styleModel" @click="clickHandler"></div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";
import StyleModel from "../models/StyleModel";

@Component
export default class Shape extends Vue {
    @Prop({ type: String, required: true })
    public id?: string;

    @Prop({ type: StyleModel, default: () => new StyleModel() })
    public styleModel?: StyleModel;

    private clickHandler() {
        this.$store.commit("setFocusedShape", this.id);
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#shape {
    cursor: pointer;
}
</style>
