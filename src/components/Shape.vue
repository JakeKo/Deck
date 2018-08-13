/* tslint:disable */
<template>
<polygon @click="clickHandler" points="100,10 40,198 190,78 10,78 160,198"
    :fill="styleModel.fill" :stroke="styleModel.stroke" :stroke-width="styleModel.strokeWidth" fill-rule="evenodd" />
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

    @Prop({ type: Boolean, default: false })
    public focused?: boolean;

    private clickHandler() {
        this.$store.commit("setFocusedShape", this.id);
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
polygon {
    cursor: pointer;
}
</style>
