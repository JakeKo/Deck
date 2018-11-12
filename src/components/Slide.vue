/* tslint:disable */
<template>
<div :id="slideId" :style="slideStyle"></div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";
import * as SVG from "svg.js";
import GraphicModel from "../models/GraphicModel";

@Component
export default class Slide extends Vue {
    private canvas!: SVG.Doc;

    @Prop({ type: String, required: true })
    private id!: string;

    @Prop({ type: Array, default: () => new Array<GraphicModel>() })
    private graphics!: GraphicModel[];

    @Prop({ type: Boolean, default: false })
    private isActive!: boolean;

    @Prop({ type: String, default: "" })
    private focusedGraphicId!: string;

    // Necessary to generate unique id field so SVG canvas is bound to each slide
    get slideId(): string {
        return `slide_${this.id}`;
    }

    get slideStyle(): any {
        return {
            boxShadow: `0 0 4px 0 ${this.$store.getters.theme.tertiary}`,
            background: this.$store.getters.theme.primary,
            display: this.isActive ? "block" : "none",
            height: "603px",
            width: "1072px"
        };
    }

    public mounted(): void {
        this.canvas = SVG(this.$el.id);
    }

    public updated(): any {
        this.graphics.forEach((graphic: GraphicModel) => {
            switch (graphic.type) {
                case "rectangle":
                    this.canvas.rect(50, 100).attr({
                        fill: graphic.styleModel.fill,
                    });
                    break;
                default: break;
            }
        });

        return;
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
svg {
    height: 100%;
    width: 100%;
}
</style>
