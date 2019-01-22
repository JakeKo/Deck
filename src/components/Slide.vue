<template>
<div :id="`slide_${id}`" :class="{ 'slide': true, 'active-slide': isActive }"></div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import * as SVG from "svg.js";
import IGraphic from "../models/IGraphic";

@Component
export default class Slide extends Vue {
    private canvas!: SVG.Doc;
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Prop({ type: Array, required: true }) private graphics!: Array<IGraphic>;

    @Watch("graphics", { deep: true }) public refreshCanvas(): void {
        this.canvas.clear();
        this.graphics.forEach((graphic: IGraphic) => this.initializeGraphic(graphic));
    }

    private mounted(): void {
        const canvasResolution: number = this.$store.getters.canvasResolution;
        this.canvas = SVG(this.$el.id).viewbox(0, 0, canvasResolution * 1072, canvasResolution * 603);

        this.canvas.on("mouseover", (event: MouseEvent) => this.$store.getters.tool.canvasMouseOver(this.canvas)(event));
        this.canvas.on("mouseout", (event: MouseEvent) => this.$store.getters.tool.canvasMouseOut(this.canvas)(event));
        this.canvas.on("mousedown", (event: MouseEvent) => this.$store.getters.tool.canvasMouseDown(this, this.canvas)(event));

        this.refreshCanvas();
    }

    private initializeGraphic(graphic: IGraphic): void {
        const svg: SVG.Element = graphic.render(this.canvas);

        // Bind each event handler
        svg.on("mouseover", (event: MouseEvent) => this.$store.getters.tool.graphicMouseOver(svg)(event));
        svg.on("mouseout", (event: MouseEvent) => this.$store.getters.tool.graphicMouseOut(svg)(event));
        svg.on("mousedown", (event: MouseEvent) => this.$store.getters.tool.graphicMouseDown(this, svg, graphic)(event));

        // Render the bounding box if the graphic is focused
        if (this.$store.getters.focusedGraphic === graphic) {
            graphic.boundingBox.render(this.canvas);
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../styles/colors";

.slide {
    box-shadow: 0 0 4px 0 $color-tertiary;
    background: $color-primary;
    display: none;
    height: 603px;
    width: 1072px;
}

.active-slide {
    display: block !important;
}

svg {
    height: 100%;
    width: 100%;
}
</style>
