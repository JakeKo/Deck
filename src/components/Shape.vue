/* tslint:disable */
<template>
<polygon @click="$emit('shape-focused', id)" :points="pointsToString"
    :fill="styleModel.fill" :stroke="styleModel.stroke" :stroke-width="styleModel.strokeWidth" fill-rule="evenodd" />
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";
import StyleModel from "../models/StyleModel";
import Point from "../models/Point";

@Component
export default class Shape extends Vue {
    @Prop({ type: String, required: true })
    public id?: string;

    @Prop({ type: StyleModel, default: () => new StyleModel() })
    public styleModel?: StyleModel;

    @Prop({ type: Boolean, default: false })
    public focused?: boolean;

    @Prop({ type: Array, required: true })
    public points?: Point[];

    get pointsToString() {
        const points = this.points || new Array<Point>();
        return points.map((point) => `${point.x},${point.y}`).reduce((base, value) => `${base} ${value}`);
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
polygon {
    cursor: pointer;
}
</style>
