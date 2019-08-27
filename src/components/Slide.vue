<template>
<div :id='`slide_${id}`' :class='{ "slide": true, "active-slide": isActive }'>
    <div class='slide-box'></div>
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import * as SVG from 'svg.js';
import SlideWrapper from '../models/SlideWrapper';
import { IGraphic, CustomCanvasMouseEvent, ISlideWrapper, CanvasKeyboardEvent, CustomCanvasKeyboardEvent } from '../types';

@Component
export default class Slide extends Vue {
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Prop({ type: Array, required: true }) private graphics!: Array<IGraphic>;

    private mounted(): void {
        const viewbox: { x: number, y: number, width: number, height: number } = this.$store.getters.rawViewbox;
        const canvas: SVG.Doc = SVG(this.$el.id).viewbox(viewbox.x, viewbox.y, viewbox.width, viewbox.height).style({ position: 'absolute', top: 0, left: 0 });
        const slideWrapper: ISlideWrapper = new SlideWrapper(this.id, canvas, this.$store, true);

        slideWrapper.addCanvasEventListener('Deck.CanvasMouseOver', ((event: CustomCanvasMouseEvent): void => {
            this.$store.getters.tool.canvasMouseOver(slideWrapper)(event);
        }));

        slideWrapper.addCanvasEventListener('Deck.CanvasMouseOut', ((event: CustomCanvasMouseEvent): void => {
            this.$store.getters.tool.canvasMouseOut(slideWrapper)(event);
        }));

        slideWrapper.addCanvasEventListener('Deck.CanvasMouseDown', ((event: CustomCanvasMouseEvent): void => {
            this.$store.getters.tool.canvasMouseDown(slideWrapper)(event);
        }));

        this.graphics.forEach((graphic: IGraphic): void => {
            slideWrapper.addGraphic(graphic);
        });

        slideWrapper.addCanvasEventListener('Deck.CanvasKeyDown', ((event: CustomCanvasKeyboardEvent): void => {
            if (['Delete', 'Backspace'].indexOf(event.detail.baseEvent.key) !== -1) {
                if (this.$store.getters.focusedGraphic === undefined) {
                    return;
                }

                // Remove the focused graphic
                const graphicId: string = this.$store.getters.focusedGraphic.id;
                slideWrapper.focusGraphic(undefined);
                this.$store.commit('focusGraphic', { slideId: slideWrapper.slideId, graphicId: undefined });
                this.$store.commit('removeGraphic', { slideId: slideWrapper.slideId, graphicId: graphicId });
                this.$store.commit('removeSnapVectors', { slideId: slideWrapper.slideId, graphicId: graphicId });
                this.$store.commit('graphicEditorGraphicId', undefined);
                slideWrapper.removeGraphic(graphicId);
            }
        }) );
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
