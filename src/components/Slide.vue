/* tslint:disable */
<template>
<div id="slide" :style="slideStyle"></div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";
import * as SVG from "svg.js";
import ShapeModel from "../models/ShapeModel";

@Component
export default class Slide extends Vue {
    private canvas!: SVG.Doc;

    @Prop({ type: Array, default: () => new Array<ShapeModel>() })
    private graphics!: ShapeModel[];

    @Prop({ type: Boolean, default: false })
    private isActive!: boolean;

    @Prop({ type: String, default: "" })
    private focusedGraphicId!: string;

    get slideStyle(): any {
        return {
            boxShadow: `0 0 4px 0 ${this.$store.getters.theme.tertiary}`,
            background: this.$store.getters.theme.primary,
            display: this.isActive ? "block" : "none"
        };
    }

    public mounted(): void {
        this.canvas = SVG(this.$el.id);
        this.displayGraphics;
    }

    get displayGraphics(): any {
        this.graphics.forEach((graphic: ShapeModel) => {
            switch (graphic.type) {
                case "rectangle":
                    this.canvas.rect(50, Math.random() * 100).attr({
                        fill: "red",
                    });
                    break;
                default: break;
            }
        });

        return true;
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#slide {
    height: 603px;
    width: 1072px;
}

svg {
    height: 100%;
    width: 100%;
}
</style>
