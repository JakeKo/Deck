/* tslint:disable */
<template>
<div :id="slideId" :style="slideStyle"></div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";
import * as SVG from "svg.js";
import GraphicModel from "../models/GraphicModel";
import Point from "../models/Point";
import ToolModel from "../models/ToolModel";

@Component
export default class Slide extends Vue {
    private canvas!: SVG.Doc;

    @Prop({ type: String, required: true })
    private id!: string;

    @Prop({ type: ToolModel, required: true })
    private tool!: ToolModel;

    @Prop({ type: Array, default: () => new Array<GraphicModel>() })
    private graphics!: GraphicModel[];

    // Necessary to generate unique id field so SVG canvas is bound to each slide
    get slideId(): string {
        return `slide_${this.id}`;
    }

    get slideStyle(): any {
        return {
            boxShadow: `0 0 4px 0 ${this.$store.getters.theme.tertiary}`,
            background: this.$store.getters.theme.primary,
            display: this.id === this.$store.getters.activeSlide.id ? "block" : "none",
            height: "603px",
            width: "1072px"
        };
    }

    public mounted(): void {
        this.canvas = SVG(this.$el.id);
        this.graphics.push(new GraphicModel({ type: "rectangle" }));
        this.initializeGraphics();
    }

    public initializeGraphics(): any {
        const self: Slide = this;

        self.graphics.forEach((graphic: GraphicModel) => {
            let svg: SVG.Element;

            switch (graphic.type) {
                case "rectangle":
                    svg = this.canvas.rect(50, 100).attr({
                        fill: graphic.styleModel.fill,
                    });
                    break;
                default: break;
            }

            svg!.on("mouseover", function(): void {
                self.$el.style.cursor = "pointer";
            });

            svg!.on("mouseout", function(): void {
                self.$el.style.cursor = "default";
            });

            // Begin moving shape on click
            svg!.on("mousedown", function(event: MouseEvent): void {
                self.$store.commit("styleEditorObject", graphic);
                const offset = new Point(event.clientX - svg!.attr("x"), event.clientY - svg!.attr("y"));
                self.canvas.on("mousemove", preview);
                self.canvas.on("mouseup", end);

                // Preview moving shape
                function preview(event: MouseEvent): void {
                    svg!.move(event.clientX - offset.x, event.clientY - offset.y);
                }

                // End moving shape
                function end(this: SVG.Element): void {
                    self.canvas.off("mousemove", preview);
                    self.canvas.off("mouseup", end);
                }
            });
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
