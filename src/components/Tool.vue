<template>
<div ref='root' :style='style.tool' @click='$emit("tool-click")'>
    <i :style='style.toolIcon' :class='icon' />
    {{name}}
</div>
</template>

<script lang='ts'>
import DeckComponent from './generic/DeckComponent';
import { defineComponent, reactive, computed } from 'vue';
import { TOOL_NAMES } from '@/tools/types';

type Props = {
    name: TOOL_NAMES;
    icon: string;
}
const Tool = defineComponent({
    setup: (props: Props) => {
        const { root, store, baseStyle, baseTheme, isHovered } = DeckComponent();
        const isActive = computed(() => store.getters.activeToolName === props.name);
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
            style,
            name: props.name,
            icon: props.icon
        };
    }
});

export default Tool;
</script>
