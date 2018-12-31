<template>
<div :id="`slide_${id}`" :class="{ 'slide': true, 'active-slide': isActive }"></div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import * as SVG from "svg.js";
import Graphic from "../models/Graphic";
import Utilities from "../utilities/general";

@Component
export default class Slide extends Vue {
    private canvas!: SVG.Doc;
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Prop({ type: Array, required: true }) private graphics!: Graphic[];

    @Watch("graphics", { deep: true }) private refreshCanvas(): void {
        this.canvas.clear();
        this.graphics.forEach((graphic: Graphic) => this.initializeGraphic(graphic));
    }

    private mounted(): void {
        const canvasResolution: number = this.$store.getters.canvasResolution;
        this.canvas = SVG(this.$el.id).viewbox(0, 0, canvasResolution * 1072, canvasResolution * 603);

        this.canvas.on("mouseover", (event: MouseEvent) => this.$store.getters.tool.canvasMouseOver(this.canvas)(event));
        this.canvas.on("mouseout", (event: MouseEvent) => this.$store.getters.tool.canvasMouseOut(this.canvas)(event));
        this.canvas.on("mousedown", (event: MouseEvent) => this.$store.getters.tool.canvasMouseDown(this, this.canvas)(event));

        this.refreshCanvas();
    }

    private initializeGraphic(graphic: Graphic): void {
        const svg: SVG.Element = Utilities.renderGraphic(graphic, this.canvas);

        // Bind each event handler
        svg.on("mouseover", (event: MouseEvent) => this.$store.getters.tool.graphicMouseOver(svg)(event));
        svg.on("mouseout", (event: MouseEvent) => this.$store.getters.tool.graphicMouseOut(svg)(event));
        svg.on("mousedown", (event: MouseEvent) => this.$store.getters.tool.graphicMouseDown(this, svg, graphic)(event));
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
