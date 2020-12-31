<template>
<div ref='root' />
</template>

<script lang='ts'>
import DeckComponent from '../generic/DeckComponent';
import { defineComponent, reactive, computed } from 'vue';

const PresentationLayer = defineComponent({
    setup: () => {
        const { root, baseTheme, baseStyle } = DeckComponent();
        const style = reactive({
            presentationLayer: computed(() => ({
                ...baseStyle.value.fullScreen,
                backgroundColor: baseTheme.value.color.base.highest
            }))
        });

        return {
            root,
            style
        };
    }
});

export default PresentationLayer;
</script>
