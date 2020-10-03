<template>
    <div ref='root' :style='style.graphicEditor'>
        <CurveEditorForm v-if='curve !== undefined' :curve='curve' :slideId='slideId' />
        <EllipseEditorForm v-if='ellipse !== undefined' :ellipse='ellipse' :slideId='slideId' />
        <RectangleEditorForm v-if='rectangle !== undefined' :rectangle='rectangle' :slideId='slideId' />
    </div>
</template>

<script lang='ts'>
import { GRAPHIC_TYPES } from '@/rendering/types';
import { computed, defineComponent, reactive } from 'vue';
import DeckComponent from './generic/DeckComponent';
import CurveEditorForm from './graphicEditorForms/CurveEditorForm.vue';
import EllipseEditorForm from './graphicEditorForms/EllipseEditorForm.vue';
import RectangleEditorForm from './graphicEditorForms/RectangleEditorForm.vue';

const GraphicEditor = defineComponent({
    components: {
        CurveEditorForm,
        EllipseEditorForm,
        RectangleEditorForm
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
        const rectangle = computed(() => {
            const graphic = focusedGraphic.value;
            if (graphic && graphic.type === GRAPHIC_TYPES.RECTANGLE) {
                return graphic;
            }
        });

        return {
            root,
            style,
            curve,
            ellipse,
            rectangle,
            slideId
        };
    }
});

export default GraphicEditor;
</script>
