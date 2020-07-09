<template>
<div :id='`slide_${id}`' :class='{ "slide": true, "active-slide": isActive }' :style='slideStyle'></div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import * as SVG from 'svg.js';
import SlideRenderer from '../rendering/SlideRenderer';
import { GETTERS, Viewbox, MUTATIONS } from '../store/types';
import { Getter, Mutation } from 'vuex-class';
import SlideStateManager from '../utilities/SlideStateManager';

@Component
export default class Slide extends Vue {
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Prop({ type: SlideStateManager, required: true }) private slideStateManager!: SlideStateManager;
    @Getter private [GETTERS.RAW_VIEWBOX]: Viewbox;
    @Getter private [GETTERS.CROPPED_VIEWBOX]: Viewbox;

    private get slideStyle(): { minWidth: string; minHeight: string; } {
        return {
            minWidth: `${this[GETTERS.RAW_VIEWBOX].width}px`,
            minHeight: `${this[GETTERS.RAW_VIEWBOX].height}px`
        };
    }

    private mounted(): void {
        const viewbox = this[GETTERS.RAW_VIEWBOX];
        const canvas = SVG(this.$el.id).viewbox(viewbox.x, viewbox.y, viewbox.width, viewbox.height).style({ position: 'absolute', top: 0, left: 0 });
        const renderer = new SlideRenderer({
            stateManager: this.slideStateManager,
            canvas,
            rawViewbox: viewbox,
            croppedViewbox: this[GETTERS.CROPPED_VIEWBOX]
        });

        this.slideStateManager.setStore(this.$store);
        this.slideStateManager.setRenderer(renderer);
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

.active-slide {
    display: flex !important;
}
</style>
