<template>
<div ref='root' :style="style.menuBar">
    <TitleField />
</div>
</template>

<script lang='ts'>
import DeckComponent from './generic/DeckComponent';
import TitleField from './TitleField.vue';
import { defineComponent, computed, reactive } from 'vue';

const MenuBar = defineComponent({
    components: {
        TitleField
    },
    setup: () => {
        const { root, baseStyle, baseTheme } = DeckComponent();
        const style = reactive({
            menuBar: computed(() => ({
                height: '28px',
                flexShrink: '0',
                boxSizing: 'border-box',
                borderBottom: `1px solid ${baseTheme.value.color.base.flush}`,
                background: baseTheme.value.color.base.highest,
                ...baseStyle.value.fontBody,
                ...baseStyle.value.flexRowCC
            }))
        });

        return {
            root,
            style
        };
    }
});

export default MenuBar;
</script>
