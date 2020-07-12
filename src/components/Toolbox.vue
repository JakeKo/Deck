<template>
<div id='toolbox'>
    <tool :name='"pointer"' :icon='"fas fa-mouse-pointer"' :isActive='isPointerToolActive' @tool-click='activatePointerTool' />
    <tool :name='"rectangle"' :icon='"fas fa-square"' :isActive='isRectangleToolActive' @tool-click='activateRectangleTool' />
    <tool :name='"ellipse"' :icon='"fas fa-circle"' :isActive='isEllipseToolActive' @tool-click='activateEllipseTool' />
    <tool :name='"curve"' :icon='"fas fa-pen-nib"' :isActive='isCurveToolActive' @tool-click='activateCurveTool' />
    <tool :name='"textbox"' :icon='"fas fa-font"' :isActive='isTextboxToolActive' @tool-click='activateTextboxTool' />
    <tool :name='"image"' :icon='"fas fa-image"' :isActive='isImageToolActive' @tool-click='activateImageTool' />
    <tool :name='"video"' :icon='"fas fa-video"' :isActive='isVideoToolActive' @tool-click='activateVideoTool' />
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import Tool from './Tool.vue';
import { PointerTool, RectangleTool, CurveTool, EllipseTool, TextboxTool, ImageTool, VideoTool } from '../tools';
import { MUTATIONS, GETTERS } from '../store/types';
import { TOOL_NAMES, EditorTool } from '../tools/types';
import { Getter, Mutation } from 'vuex-class';

@Component({
    components: {
        Tool
    }
})
export default class Toolbox extends Vue {
    @Getter private [GETTERS.ACTIVE_TOOL_NAME]: TOOL_NAMES;
    @Mutation private [MUTATIONS.ACTIVE_TOOL]: (tool: EditorTool) => void;

    private get isPointerToolActive(): boolean {
        return this[GETTERS.ACTIVE_TOOL_NAME] === TOOL_NAMES.POINTER;
    }

    private get isRectangleToolActive(): boolean {
        return this[GETTERS.ACTIVE_TOOL_NAME] === TOOL_NAMES.RECTANGLE;
    }

    private get isEllipseToolActive(): boolean {
        return this[GETTERS.ACTIVE_TOOL_NAME] === TOOL_NAMES.ELLIPSE;
    }

    private get isCurveToolActive(): boolean {
        return this[GETTERS.ACTIVE_TOOL_NAME] === TOOL_NAMES.CURVE;
    }

    private get isTextboxToolActive(): boolean {
        return this[GETTERS.ACTIVE_TOOL_NAME] === TOOL_NAMES.TEXTBOX;
    }

    private get isImageToolActive(): boolean {
        return this[GETTERS.ACTIVE_TOOL_NAME] === TOOL_NAMES.IMAGE;
    }

    private get isVideoToolActive(): boolean {
        return this[GETTERS.ACTIVE_TOOL_NAME] === TOOL_NAMES.VIDEO;
    }

    private activatePointerTool(): void {
        this[MUTATIONS.ACTIVE_TOOL](PointerTool(this.$store));
    }

    private activateRectangleTool(): void {
        this[MUTATIONS.ACTIVE_TOOL](RectangleTool(this.$store));
    }

    private activateEllipseTool(): void {
        this[MUTATIONS.ACTIVE_TOOL](EllipseTool(this.$store));
    }

    private activateCurveTool(): void {
        this[MUTATIONS.ACTIVE_TOOL](CurveTool(this.$store));
    }

    private activateTextboxTool(): void {
        this[MUTATIONS.ACTIVE_TOOL](TextboxTool(this.$store));
    }

    private activateImageTool(): void {
        this[MUTATIONS.ACTIVE_TOOL](ImageTool(this.$store));
    }

    private activateVideoTool(): void {
        this[MUTATIONS.ACTIVE_TOOL](VideoTool(this.$store));
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
