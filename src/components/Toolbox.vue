<template>
<div id='toolbox'>
    <tool :name='"pointer"' :icon='"fas fa-mouse-pointer"' :isActive='isPointerToolActive' @tool-click='activatePointerTool' />
    <tool :name='"rectangle"' :icon='"fas fa-square"' :isActive='isRectangleToolActive' @tool-click='activateRectangleTool' />
    <tool :name='"curve"' :icon='"fas fa-pen-nib"' :isActive='isCurveToolActive' @tool-click='activateCurveTool' />
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import Tool from './Tool.vue';
import pointerTool from '../tools/PointerTool';
import rectangleTool from '../tools/RectangleTool';
import curveTool from '../tools/CurveTool';
import { MUTATIONS, GETTERS } from '../store/types';
import { TOOL_NAMES } from '../tools/types';

@Component({
    components: {
        Tool
    }
})
export default class Toolbox extends Vue {
    private get isPointerToolActive(): boolean {
        return this.$store.getters[GETTERS.ACTIVE_TOOL_NAME] === TOOL_NAMES.POINTER;
    }

    private get isRectangleToolActive(): boolean {
        return this.$store.getters[GETTERS.ACTIVE_TOOL_NAME] === TOOL_NAMES.RECTANGLE;
    }

    private get isCurveToolActive(): boolean {
        return this.$store.getters[GETTERS.ACTIVE_TOOL_NAME] === TOOL_NAMES.CURVE;
    }

    private activatePointerTool(): void {
        this.$store.commit(MUTATIONS.ACTIVE_TOOL, pointerTool(this.$store));
    }

    private activateRectangleTool(): void {
        this.$store.commit(MUTATIONS.ACTIVE_TOOL, rectangleTool(this.$store));
    }

    private activateCurveTool(): void {
        this.$store.commit(MUTATIONS.ACTIVE_TOOL, curveTool(this.$store));
    }
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
