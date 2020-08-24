<template>
<div ref='root' :style='style.tool' @click='$emit("tool-click")'>
    <i :style='style.toolIcon' :class='icon' />
    {{name}}
</div>
</template>

<script lang='ts'>
import DeckComponent from './generic/DeckComponent';
import { defineComponent, reactive, computed } from 'vue';

const Tool = defineComponent({
    props: {
        name: { type: String, required: true },
        icon: { type: String, required: true }
    },
    setup: props => {
        const { root, store, baseStyle, baseTheme, isHovered } = DeckComponent();
        const isActive = computed(() => store.activeToolName.value === props.name);
        const style = reactive({
            tool: computed(() => ({
                ...baseStyle.value.flexColCC,
                ...baseStyle.value.fontLabel,
                width: '100%',
                cursor: 'pointer',
                padding: '8px 0',
                color: isActive.value ? baseTheme.value.color.base.highest : baseTheme.value.color.basecomp.lowest,
                background: isActive.value
                    ? isHovered ? baseTheme.value.color.primary.lowest : baseTheme.value.color.primary.flush
                    : isHovered ? baseTheme.value.color.base.flush : baseTheme.value.color.base.highest,
                transition: '0.25s'
            })),
            toolIcon: computed(() => ({
                fontSize: baseTheme.value.text.body.size,
                color: isActive.value ? baseTheme.value.color.base.highest : baseTheme.value.color.basecomp.lowest,
                padding: '4px 0'
            }))
        });

        return {
            root,
            style
        };
    }
});

export default Tool;
</script>
