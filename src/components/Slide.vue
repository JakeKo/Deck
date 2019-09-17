<template>
<div :id='`slide_${slideModel.id}`' :class='{ "slide": true, "active-slide": isActive }'>
    <div class='slide-box'></div>
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import * as SVG from 'svg.js';
import SlideWrapper from '../models/SlideWrapper';
import { IGraphic, CustomCanvasMouseEvent, ISlideWrapper, CanvasKeyboardEvent, CustomCanvasKeyboardEvent } from '../types';
import { EVENT_TYPES } from '../constants';
import SlideModel from '../models/Slide';

@Component
export default class Slide extends Vue {
    @Prop({ type: SlideModel, required: true }) private slideModel!: SlideModel;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;

    private mounted(): void {
        const viewbox: { x: number, y: number, width: number, height: number } = this.$store.getters.rawViewbox;
        const canvas: SVG.Doc = SVG(this.$el.id).viewbox(viewbox.x, viewbox.y, viewbox.width, viewbox.height).style({ position: 'absolute', top: 0, left: 0 });
        this.slideModel.slideWrapper = new SlideWrapper(this.slideModel.id, canvas, this.$store, true);

        this.slideModel.slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_OVER, (event: CustomCanvasMouseEvent): void => {
            this.$store.getters.tool.canvasMouseOver(this.slideModel.slideWrapper)(event);
        });

        this.slideModel.slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_OUT, (event: CustomCanvasMouseEvent): void => {
            this.$store.getters.tool.canvasMouseOut(this.slideModel.slideWrapper)(event);
        });

        this.slideModel.slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_UP, (event: CustomCanvasMouseEvent): void => {
            this.$store.getters.tool.canvasMouseUp(this.slideModel.slideWrapper)(event);
        });

        this.slideModel.slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_DOWN, (event: CustomCanvasMouseEvent): void => {
            this.$store.getters.tool.canvasMouseDown(this.slideModel.slideWrapper)(event);
        });

        this.slideModel.slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_MOVE, (event: CustomCanvasMouseEvent): void => {
            // console.log('mousemove');
            this.$store.getters.tool.canvasMouseMove(this.slideModel.slideWrapper)(event);
        });

        this.slideModel.graphics.forEach((graphic: IGraphic): void => {
            this.slideModel.slideWrapper!.addGraphic(graphic);
        });

        this.slideModel.slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_KEY_DOWN, ((event: CustomCanvasKeyboardEvent): void => {
            if (['Delete', 'Backspace'].indexOf(event.detail.baseEvent.key) !== -1) {
                if (this.$store.getters.focusedGraphic === undefined) {
                    return;
                }

                // Remove the focused graphic
                const graphicId: string = this.$store.getters.focusedGraphic.id;
                this.slideModel.slideWrapper!.focusGraphic(undefined);
                this.$store.commit('focusGraphic', { slideId: this.slideModel.slideWrapper!.slideId, graphicId: undefined });
                this.$store.commit('removeGraphic', { slideId: this.slideModel.slideWrapper!.slideId, graphicId: graphicId });
                this.$store.commit('removeSnapVectors', { slideId: this.slideModel.slideWrapper!.slideId, graphicId: graphicId });
                this.$store.commit('graphicEditorGraphicId', undefined);
                this.slideModel.slideWrapper!.removeGraphic(graphicId);
            }
        }));
    }
}
</script>

<style lang='scss' scoped>
@import '../styles/colors';

.slide {
    display: none;
    height: 100%;
    width: 100%;
    overflow: hidden;
    justify-content: center;
    align-items: center;
    position: relative;
}

.slide-box {
    box-shadow: 0 0 4px 0 $color-tertiary;
    background: $color-primary;
    height: calc(100% / 3);
    width: calc(100% / 3);
}

.active-slide {
    display: flex !important;
}
</style>
