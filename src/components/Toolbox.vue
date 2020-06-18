<template>
<div id='toolbox'>
    <tool v-for='t in tools'
        :key='t.key'
        @tool-click='t.clickHandler'
        :toolName='t.toolName'
        :icon='t.icon'
        :isActive='t.isActive'
    />
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import Tool from './Tool.vue';
import pointerTool from '../tools/PointerTool';
import rectangleTool from '../tools/RectangleTool';
import curveTool from '../tools/CurveTool';
import { TOOL_NAMES } from '../tools/types';

@Component({
    components: {
        Tool
    }
})
export default class Toolbox extends Vue {
    @Prop({ type: String, required: true }) private toolName!: string;

    private tools = [
        {
            key: Math.random(),
            clickHandler: () => this.$store.commit('setActiveTool', pointerTool(this.$store)),
            toolName: TOOL_NAMES.POINTER,
            icon: 'fas fa-mouse-pointer',
            isActive: this.toolName === TOOL_NAMES.POINTER
        },
        {
            key: Math.random(),
            clickHandler: () => this.$store.commit('setActiveTool', rectangleTool(this.$store)),
            toolName: TOOL_NAMES.RECTANGLE,
            icon: 'fas fa-square',
            isActive: this.toolName === TOOL_NAMES.RECTANGLE
        },
        {
            key: Math.random(),
            clickHandler: () => this.$store.commit('setActiveTool', curveTool(this.$store)),
            toolName: TOOL_NAMES.CURVE,
            icon: 'fas fa-pen-nib',
            isActive: this.toolName === TOOL_NAMES.CURVE
        }
    ];
}
</script>

<style lang='scss' scoped>
@import '../styles/colors';

#toolbox {
    border-right: 1px solid $color-tertiary;
    flex-direction: column;
    flex-shrink: 0;
    width: 64px;
}
</style>
