<template>
<div ref='root' :style="style.container">
    <div :style="style.slide">
        Click "Add Slide" to start your deck 😎😎
    </div>
</div>
</template>

<script lang="ts">
import DeckComponent from './generic/DeckComponent';
import { defineComponent, reactive, computed } from 'vue';

const SlidePlaceholder = defineComponent({
    setup: () => {
        const { root, store, baseStyle, baseTheme } = DeckComponent();
        const style = reactive({
            container: computed(() => ({
                ...baseStyle.value.flexRowCC,
                minWidth: `${store.getters.rawViewbox.width}px`,
                minHeight: `${store.getters.rawViewbox.height}px`
            })),
            slide: computed(() => ({
                ...baseStyle.value.flexRowCC,
                ...baseStyle.value.fontBody,
                border: `4px dashed ${baseTheme.value.color.basecomp.flush}`,
                width: `${store.getters.croppedViewbox.width}px`,
                height: `${store.getters.croppedViewbox.height}px`
            }))
        });

        return {
            root,
            style
        };
    }
});

export default SlidePlaceholder;
</script>
