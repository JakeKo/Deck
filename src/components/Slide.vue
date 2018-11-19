/* tslint:disable */
<template>
<div :id="`slide_${id}`" :style="slideStyle"></div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import * as SVG from "svg.js";
import GraphicModel from "../models/GraphicModel";
import StyleModel from "../models/StyleModel";

@Component
export default class Slide extends Vue {
    public canvas!: SVG.Doc;

    @Prop({ type: String, required: true })
    private id!: string;

    @Prop({ type: Array, default: () => new Array<GraphicModel>() })
    private graphics!: GraphicModel[];

    @Watch("graphics")
    private refreshCanvas(): void {
        this.canvas.clear();
        this.graphics.forEach((graphic: GraphicModel) => this.initializeGraphic(graphic));
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

        this.canvas.on("mouseover", (event: MouseEvent) => this.$store.getters.tool.canvasMouseOver(this.canvas)(event));
        this.canvas.on("mouseout", (event: MouseEvent) => this.$store.getters.tool.canvasMouseOut(this.canvas)(event));
        this.canvas.on("mousedown", (event: MouseEvent) => this.$store.getters.tool.canvasMouseDown(this, this.canvas)(event));

        this.refreshCanvas();
    }

    private initializeGraphic(graphic: GraphicModel): void {
        const svg: SVG.Element = this.renderGraphic(graphic);

        // Bind each event handler
        svg.on("mouseover", (event: MouseEvent) => this.$store.getters.tool.graphicMouseOver(svg)(event));
        svg.on("mouseout", (event: MouseEvent) => this.$store.getters.tool.graphicMouseOut(svg)(event));
        svg.on("mousedown", (event: MouseEvent) => this.$store.getters.tool.graphicMouseDown(this, svg, graphic)(event));
    }

    private renderGraphic(graphic: GraphicModel): SVG.Element {
        const style: StyleModel = graphic.styleModel;

        if (graphic.type === "rectangle") {
            return this.canvas.rect(style.width, style.height).attr({
                "x": style.x,
                "y": style.y,
                "fill": style.fill,
                "stroke": style.stroke,
                "stroke-width": style.strokeWidth
            });
        } else if (graphic.type === "textbox") {
            return this.canvas.text(style.message).attr({
                "x": style.x,
                "y": style.y
            });
        }

        throw `Undefined type of graphic: ${graphic.type}`;
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
