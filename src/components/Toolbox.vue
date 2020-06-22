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
import { PointerTool, RectangleTool, CurveTool } from '../tools';
import { MUTATIONS, GETTERS } from '../store/types';
import { TOOL_NAMES, EditorTool } from '../tools/types';
import { mapGetters, mapMutations } from 'vuex';

@Component({
    components: {
        Tool
    },
    computed: mapGetters([GETTERS.ACTIVE_TOOL_NAME]),
    methods: mapMutations([MUTATIONS.ACTIVE_TOOL])
})
export default class Toolbox extends Vue {
    private [GETTERS.ACTIVE_TOOL_NAME]: TOOL_NAMES;
    private [MUTATIONS.ACTIVE_TOOL]: (tool: EditorTool) => void;

    private get isPointerToolActive(): boolean {
        return this[GETTERS.ACTIVE_TOOL_NAME] === TOOL_NAMES.POINTER;
    }

    private get isRectangleToolActive(): boolean {
        return this[GETTERS.ACTIVE_TOOL_NAME] === TOOL_NAMES.RECTANGLE;
    }

    private get isCurveToolActive(): boolean {
        return this[GETTERS.ACTIVE_TOOL_NAME] === TOOL_NAMES.CURVE;
    }

    private activatePointerTool(): void {
        this[MUTATIONS.ACTIVE_TOOL](PointerTool(this.$store));
    }

    private activateRectangleTool(): void {
        this[MUTATIONS.ACTIVE_TOOL](RectangleTool(this.$store));
    }

    private activateCurveTool(): void {
        this[MUTATIONS.ACTIVE_TOOL](CurveTool(this.$store));
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
