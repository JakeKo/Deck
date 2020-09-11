<template>
    <div ref='root' :style='style.graphicEditor'>
        <RectangleEditorForm />
    </div>
</template>

<script lang='ts'>
import { computed, defineComponent, reactive } from 'vue';
import DeckComponent from './generic/DeckComponent';
import RectangleEditorForm from './graphicEditorForms/RectangleEditorForm.vue';

const GraphicEditor = defineComponent({
    components: {
        RectangleEditorForm
    },
    setup: () => {
        const { root, store, baseTheme } = DeckComponent();
        const style = reactive({
            graphicEditor: computed(() => ({
                height: '100%',
                width: '320px',
                flexShrink: '0'
            }))
        });

        return {
            root,
            style
        };
    }
});

export default GraphicEditor;
</script>
