<template>
<div id='toolbox'>
    <tool :name='"pointer"' :icon='"fas fa-mouse-pointer"' :isActive='$store.getters.activeToolName === "pointer"' @tool-click='activatePointerTool' />
    <tool :name='"rectangle"' :icon='"fas fa-square"' :isActive='$store.getters.activeToolName === "rectangle"' @tool-click='activateRectangleTool' />
    <tool :name='"curve"' :icon='"fas fa-pen-nib"' :isActive='$store.getters.activeToolName === "curve"' @tool-click='activateCurveTool' />
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import Tool from './Tool.vue';
import pointerTool from '../tools/PointerTool';
import rectangleTool from '../tools/RectangleTool';
import curveTool from '../tools/CurveTool';

@Component({
    components: {
        Tool
    }
})
export default class Toolbox extends Vue {
    private activatePointerTool(): void {
        this.$store.commit('setActiveTool', pointerTool(this.$store));
    }

    private activateRectangleTool(): void {
        this.$store.commit('setActiveTool', rectangleTool(this.$store));
    }

    private activateCurveTool(): void {
        this.$store.commit('setActiveTool', curveTool(this.$store));
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
