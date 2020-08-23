<template>
<div ref='root' :style="style.toolbox">
    <Tool v-for='tool in tools'
        :key='tool.name'
        :name='tool.name'
        :icon='tool.icon'
        @tool-click='tool.activator'
    />
</div>
</template>

<script lang='ts'>
import Tool from './Tool.vue';
import { PointerTool, RectangleTool, CurveTool, EllipseTool, TextboxTool, ImageTool, VideoTool } from '../tools';
import { TOOL_NAMES } from '../tools/types';
import DeckComponent from './generic/DeckComponent';
import { defineComponent, reactive, computed } from 'vue';

const Toolbox = defineComponent({
    components: {
        Tool
    },
    setup: () => {
        const { root, store, baseStyle, baseTheme } = DeckComponent();
        const style = reactive({
            toolbox: computed(() => ({
                borderRight: `1px solid ${baseTheme.value.color.base.flush}`,
                ...baseStyle.value.flexCol,
                flexShrink: 0,
                width: '64px'
            }))
        });
        const tools = reactive([
            {
                name: TOOL_NAMES.POINTER,
                icon: 'fas fa-mouse-pointer',
                activator: () => store.mutations.setActiveTool(PointerTool(store))
            },
            {
                name: TOOL_NAMES.RECTANGLE,
                icon: 'fas fa-square',
                activator: () => store.mutations.setActiveTool(RectangleTool(store))
            },
            {
                name: TOOL_NAMES.ELLIPSE,
                icon: 'fas fa-circle',
                activator: () => store.mutations.setActiveTool(EllipseTool(store))
            },
            {
                name: TOOL_NAMES.CURVE,
                icon: 'fas fa-pen-nib',
                activator: () => store.mutations.setActiveTool(CurveTool(store))
            },
            {
                name: TOOL_NAMES.TEXTBOX,
                icon: 'fas fa-font',
                activator: () => store.mutations.setActiveTool(TextboxTool(store))
            },
            {
                name: TOOL_NAMES.IMAGE,
                icon: 'fas fa-image',
                activator: () => store.mutations.setActiveTool(ImageTool(store))
            },
            {
                name: TOOL_NAMES.VIDEO,
                icon: 'fas fa-video',
                activator: () => store.mutations.setActiveTool(VideoTool(store))
            }
        ]);

        return {
            root,
            style,
            tools
        };
    }
});

export default Toolbox;
</script>
