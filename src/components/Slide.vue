<template>
<div :id='`slide_${id}`' :style='slideStyle'></div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import * as SVG from 'svg.js';
import SlideRenderer from '../rendering/SlideRenderer';
import { GETTERS, Viewbox, MUTATIONS } from '../store/types';
import { Getter, Mutation } from 'vuex-class';
import SlideStateManager from '../utilities/SlideStateManager';
import { StyleCreator } from '../styling/types';
import DeckComponent from './generic/DeckComponent';

type StyleProps = {
    raw: Viewbox;
};
type Style = {
    slide: any;
    activeSlide: any;
};
const componentStyle: StyleCreator<StyleProps, Style> = ({ theme, base, props }) => ({
    slide: {
        minWidth: `${props.raw.width}px`,
        minHeight: `${props.raw.height}px`,
        ...base.flexRowCC,
        display: 'none',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative'
    },
    activeSlide: {
        display: 'flex'
    }
});

@Component
export default class Slide extends DeckComponent<StyleProps, Style> {
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Prop({ type: SlideStateManager, required: true }) private stateManager!: SlideStateManager;
    @Getter private [GETTERS.RAW_VIEWBOX]: Viewbox;
    @Getter private [GETTERS.CROPPED_VIEWBOX]: Viewbox;
    @Getter private [GETTERS.EDITOR_ZOOM_LEVEL]: number;

    private get slideStyle(): any {
        const style = this[GETTERS.STYLE]({ raw: this[GETTERS.RAW_VIEWBOX] }, componentStyle);
        return {
            ...style.slide,
            ...this.isActive && style.activeSlide
        };
    }

    public mounted(): void {
        this.bindEvents();
        const viewbox = this[GETTERS.RAW_VIEWBOX];
        const canvas = SVG(this.$el.id).viewbox(viewbox.x, viewbox.y, viewbox.width, viewbox.height).style({ position: 'absolute', top: 0, left: 0 });
        const renderer = new SlideRenderer({
            stateManager: this.stateManager,
            canvas,
            rawViewbox: viewbox,
            croppedViewbox: this[GETTERS.CROPPED_VIEWBOX],
            zoom: this[GETTERS.EDITOR_ZOOM_LEVEL]
        });

        this.stateManager.setStore(this.$store);
        this.stateManager.setRenderer(renderer);
    }
}
</script>
