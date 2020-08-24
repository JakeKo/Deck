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
                minWidth: `${store.rawViewbox.value.width}px`,
                minHeight: `${store.rawViewbox.value.height}px`
            })),
            slide: computed(() => ({
                ...baseStyle.value.flexRowCC,
                ...baseStyle.value.fontBody,
                border: `4px dashed ${baseTheme.value.color.basecomp.flush}`,
                width: `${store.croppedViewbox.value.width}px`,
                height: `${store.croppedViewbox.value.height}px`
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
