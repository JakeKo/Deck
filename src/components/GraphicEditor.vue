<template>
    <div ref='root' :style='style.graphicEditor'>
        <RectangleEditorForm v-if='rectangle !== undefined' :rectangle='rectangle' :slideId='slideId' />
    </div>
</template>

<script lang='ts'>
import { GRAPHIC_TYPES } from '@/rendering/types';
import { computed, defineComponent, reactive } from 'vue';
import DeckComponent from './generic/DeckComponent';
import RectangleEditorForm from './graphicEditorForms/RectangleEditorForm.vue';

const GraphicEditor = defineComponent({
    components: {
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
        const rectangle = computed(() => {
            const focusedGraphics = activeSlide.value?.focusedGraphics;
            if (focusedGraphics === undefined) {
                return;
            }

            const [key, ...otherKeys] = Object.keys(focusedGraphics);
            if (!key || otherKeys.length > 0) {
                return;
            }

            const focusedGraphic = focusedGraphics[key];
            if (focusedGraphic.type === GRAPHIC_TYPES.RECTANGLE) {
                return focusedGraphic;
            }
        });

        return {
            root,
            style,
            rectangle,
            slideId
        };
    }
});

export default GraphicEditor;
</script>
