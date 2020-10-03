<template>
    <div ref='root' :style='style.graphicEditor'>
        <RectangleEditorForm v-if='rectangle !== undefined' :rectangle='rectangle' :slideId='slideId' />
        <CurveEditorForm v-if='curve !== undefined' :curve='curve' :slideId='slideId' />
    </div>
</template>

<script lang='ts'>
import { GRAPHIC_TYPES } from '@/rendering/types';
import { computed, defineComponent, reactive } from 'vue';
import DeckComponent from './generic/DeckComponent';
import RectangleEditorForm from './graphicEditorForms/RectangleEditorForm.vue';
import CurveEditorForm from './graphicEditorForms/CurveEditorForm.vue';

const GraphicEditor = defineComponent({
    components: {
        RectangleEditorForm,
        CurveEditorForm
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
        const rectangle = computed(() => {
            const graphic = focusedGraphic.value;
            if (graphic && graphic.type === GRAPHIC_TYPES.RECTANGLE) {
                return graphic;
            }
        });
        const curve = computed(() => {
            const graphic = focusedGraphic.value;
            if (graphic && graphic.type === GRAPHIC_TYPES.CURVE) {
                return graphic;
            }
        });

        return {
            root,
            style,
            rectangle,
            curve,
            slideId
        };
    }
});

export default GraphicEditor;
</script>
