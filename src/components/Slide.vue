<template>
<div :id='`slide_${id}`' :class='{ "slide": true, "active-slide": isActive }' :style='slideStyle'></div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import * as SVG from 'svg.js';
import SlideRenderer from '../rendering/SlideRenderer';

@Component
export default class Slide extends Vue {
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;

    get slideStyle(): { minWidth: string; minHeight: string; } {
        return {
            minWidth: `${this.$store.getters.rawEditorViewbox.width}px`,
            minHeight: `${this.$store.getters.rawEditorViewbox.height}px`
        };
    }

    private mounted(): void {
        const viewbox = this.$store.getters.rawEditorViewbox;
        const canvas = SVG(this.$el.id).viewbox(viewbox.x, viewbox.y, viewbox.width, viewbox.height).style({ position: 'absolute', top: 0, left: 0 });
        const renderer = new SlideRenderer({ canvas });
        renderer.renderBackdrop(this.$store.getters.croppedEditorViewbox.width, this.$store.getters.croppedEditorViewbox.height);
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
