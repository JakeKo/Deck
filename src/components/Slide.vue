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
    public canvas!: SVG.Doc;

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

        this.canvas.on("mousedown", (event: MouseEvent) => {
           if (this.tool.canvasMouseDown !== undefined) {
               this.tool.canvasMouseDown(this, this.canvas)(event);
           }
        });

        this.graphics.push(new GraphicModel());
    }

    public updateCanvas(): void {
        this.canvas.clear();
        this.graphics.forEach((graphic: GraphicModel) => this.addGraphic(graphic));
    }

    private renderGraphic(graphic: GraphicModel): SVG.Element {
        // TODO: Handle multiples type of graphics
        return this.canvas.rect(50, 100);
    }

    public addGraphic(graphic: GraphicModel): void {
        const svg: SVG.Element = this.renderGraphic(graphic);

        // Bind each event handler for all that exist
        svg.on("mouseover", (event: MouseEvent) => {
            if (this.tool.graphicMouseOver !== undefined) {
                this.tool.graphicMouseOver(svg)(event);
            }
        });

        svg.on("mouseout", (event: MouseEvent) => {
            if (this.tool.graphicMouseOut !== undefined) {
                this.tool.graphicMouseOut(svg)(event);
            }
        });

        svg.on("mousedown", (event: MouseEvent) => {
            if (this.tool.graphicMouseDown !== undefined) {
                this.tool.graphicMouseDown(this, svg, graphic)(event);
            }
        });
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
