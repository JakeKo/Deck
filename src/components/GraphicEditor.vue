<template>
<div id='graphic-editor'>
    <div class='stretcher-horizontal left' @mousedown='stretch'></div>
    <div id='graphic-editor-interaction-message' v-if='$store.getters.graphicEditorGraphicId === undefined'>
        <strong>Graphic Editor:</strong>Click on a graphic to edit its properties.
    </div>
    <textarea id='graphic-editor-content' v-if='$store.getters.graphicEditorGraphicId !== undefined' v-model='object' @keydown='handleKeydown'></textarea>
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import Utilities from '../utilities';
import { IGraphic, GraphicEditorFormat } from '../types';
import { Sketch, Curve, Image, Video } from '../models/graphics/graphics';
import Vector from '../models/Vector';

@Component
export default class StyleEditor extends Vue {
    private metadata: any = {};

    get object(): string {
        const graphic: IGraphic | undefined = this.$store.getters.graphicEditorGraphic;
        const { metadata, data }: GraphicEditorFormat = graphic === undefined ? { metadata: {}, data: {} } : graphic.toGraphicEditorFormat();
        this.metadata = metadata;
        return Utilities.toPrettyString(data);
    }

    set object(graphicEditorObject: string) {
        try {
            const graphic: IGraphic = Utilities.parseGraphic({ ...this.metadata, ...JSON.parse(graphicEditorObject) });
            this.$store.commit('updateGraphic', { slideId: this.$store.getters.activeSlide.id, graphicId: graphic.id, graphic: graphic });
            this.$store.commit('focusGraphic', { slideId: this.$store.getters.activeSlide.id, graphicId: graphic.id });
        } catch (exception) {
            // If the JSON in the graphic editor is misformatted (which happens a lot mid-typing), JSON.parse will throw an exception
            // Somewhat-silently ignore the exception
            console.log(exception.message);
        }
    }

    private handleKeydown(event: KeyboardEvent): void {
        // Prevent propagation so pressing 'Delete' or 'Backspace' won't remove graphics from the active slide
        // TODO: Devise better way to handle removing graphics such that graphics are only removed if a delete-ish key is pressed while the editor is 'focused'
        event.stopPropagation();

        // Submit the input field if 'Shift + Enter' is pressed
        if (event.key === 'Enter' && event.shiftKey) {
            (event.target as HTMLInputElement).blur();
        }
    }

    private stretch(): void {
        document.addEventListener('mousemove', preview);
        document.addEventListener('mouseup', end);

        const self = this;
        function preview(event: MouseEvent): void {
            (self.$el as HTMLElement).style.width = `${Math.max(window.innerWidth - event.pageX, 128)}px`;
        }

        function end(): void {
            document.removeEventListener('mousemove', preview);
            document.removeEventListener('mouseup', end);
        }
    }
}
</script>

<style lang='scss' scoped>
@import '../styles/application';

#graphic-editor {
    position: relative;
    display: flex;
    flex-direction: column;
    background: $color-primary;
    border-left: 1px solid $color-tertiary;
    flex-shrink: 0;
    width: 350px;
    min-width: 96px;
}

#graphic-editor-interaction-message {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding: 36px 10%;
    box-sizing: border-box;
    font-family: 'Roboto Mono', monospace;
    color: $color-dark;
    font-size: 14px;
    text-align: center;
}

#graphic-editor-content {
    font-family: 'Roboto Mono', monospace;
    font-size: 14px;
    border: none;
    outline: none;
    flex-grow: 1;
    width: 100%;
    height: 100%;
    resize: none;
    box-sizing: border-box;
    padding: 8px;
    white-space: nowrap;
}
</style>
