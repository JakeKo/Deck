<template>
    <div ref='root' :style='style.graphicEditor'>
        <CurveEditorForm v-if='curve !== undefined' :curve='curve' :slideId='slideId' />
        <EllipseEditorForm v-if='ellipse !== undefined' :ellipse='ellipse' :slideId='slideId' />
        <ImageEditorForm v-if='image !== undefined' :image='image' :slideId='slideId' />
        <RectangleEditorForm v-if='rectangle !== undefined' :rectangle='rectangle' :slideId='slideId' />
        <TextboxEditorForm v-if='textbox !== undefined' :textbox='textbox' :slideId='slideId' />
    </div>
</template>

<script lang='ts'>
import { GRAPHIC_TYPES } from '@/rendering/types';
import { computed, defineComponent, reactive } from 'vue';
import DeckComponent from './generic/DeckComponent';
import CurveEditorForm from './graphicEditorForms/CurveEditorForm.vue';
import EllipseEditorForm from './graphicEditorForms/EllipseEditorForm.vue';
import ImageEditorForm from './graphicEditorForms/ImageEditorForm.vue';
import RectangleEditorForm from './graphicEditorForms/RectangleEditorForm.vue';
import TextboxEditorForm from './graphicEditorForms/TextboxEditorForm.vue';

const GraphicEditor = defineComponent({
    components: {
        CurveEditorForm,
        EllipseEditorForm,
        ImageEditorForm,
        RectangleEditorForm,
        TextboxEditorForm
    },
    setup: () => {
        const { root, store } = DeckComponent();
        const style = reactive({
            graphicEditor: computed(() => ({
                height: '100%',
                width: '320px',
                flexShrink: '0'
            }))
        });

        const activeSlide = computed(() => store.state.activeSlide);
        const slideId = computed(() => activeSlide.value?.id || '');
        const focusedGraphic = computed(() => {
            const focusedGraphics = activeSlide.value?.focusedGraphics;
            if (focusedGraphics === undefined) {
                return;
            }

            const [key, ...otherKeys] = Object.keys(focusedGraphics);
            if (!key || otherKeys.length > 0) {
                return;
            }

            return focusedGraphics[key];
        });

        const curve = computed(() => {
            const graphic = focusedGraphic.value;
            if (graphic && graphic.type === GRAPHIC_TYPES.CURVE) {
                return graphic;
            }
        });
        const ellipse = computed(() => {
            const graphic = focusedGraphic.value;
            if (graphic && graphic.type === GRAPHIC_TYPES.ELLIPSE) {
                return graphic;
            }
        });
        const image = computed(() => {
            const graphic = focusedGraphic.value;
            if (graphic && graphic.type === GRAPHIC_TYPES.IMAGE) {
                return graphic;
            }
        });
        const rectangle = computed(() => {
            const graphic = focusedGraphic.value;
            if (graphic && graphic.type === GRAPHIC_TYPES.RECTANGLE) {
                return graphic;
            }
        });
        const textbox = computed(() => {
            const graphic = focusedGraphic.value;
            if (graphic && graphic.type === GRAPHIC_TYPES.TEXTBOX) {
                return graphic;
            }
        });

        return {
            root,
            style,
            curve,
            ellipse,
            image,
            rectangle,
            textbox,
            slideId
        };
    }
});

export default GraphicEditor;
</script>
