<template>
    <div ref='root' :style='style.graphicEditor'>
        <RectangleEditorForm v-if='rectangle !== undefined' />
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

        const rectangle = computed(() => {
            const focusedGraphics = store.state.activeSlide?.focusedGraphics;
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
            rectangle
        };
    }
});

export default GraphicEditor;
</script>
