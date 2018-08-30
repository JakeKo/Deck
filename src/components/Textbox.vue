/* tslint:disable */
<template>
<text :x="x" :y="y" :fill="styleModel.fill" @click="clickHandler">{{text}}</text>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";
import TextboxStyleModel from "../models/TextboxStyleModel";
import ISlideElement from "../models/ISlideElement";

@Component
export default class Textbox extends Vue implements ISlideElement{
    @Prop({ type: String, required: true })
    public id?: string;

    @Prop({ type: Number, default: 0 })
    public x?: number;

    @Prop({ type: Number, default: 0 })
    public y?: number;

    @Prop({ type: String, default: "Lorem Ispum" })
    public text?: string;

    @Prop({ type: TextboxStyleModel, default: () => new TextboxStyleModel() })
    public styleModel?: TextboxStyleModel;

    public clickHandler(event: Event): void {
        this.$emit("text-focused", this.id);
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
</style>
