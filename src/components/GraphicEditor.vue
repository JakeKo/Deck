<template>
    <div ref='root' :style='style.graphicEditor'>
        <RectangleEditorForm v-if='rectangle !== undefined' :rectangle='rectangle' />
    </div>
</template>

<script lang='ts'>
import { GRAPHIC_TYPES } from '@/rendering/types';
import { RectangleStoreModel } from '@/store/types';
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
            const focusedGraphics = store.state.activeSlide === undefined ? {} : store.state.activeSlide.focusedGraphics;
            const keys = Object.keys(focusedGraphics);
            if (keys.length === 1 && focusedGraphics[keys[0]].type === GRAPHIC_TYPES.RECTANGLE) {
                return focusedGraphics[keys[0]] as RectangleStoreModel;
            }

            return undefined;
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
