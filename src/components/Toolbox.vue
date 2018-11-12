/* tslint:disable */
<template>
<div id="toolbox" :style="toolboxStyle">
    <tool @tool-click="$store.commit('mountTool', { tool: 'rectangle', slideId: $store.getters.activeSlide.id })"></tool>
    <tool @tool-click="$store.commit('mountTool', { tool: 'textbox', slideId: $store.getters.activeSlide.id })"></tool>
    <tool @tool-click="$store.dispatch('export')"></tool>
    <tool></tool>
    <tool></tool>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";
import Tool from "./Tool.vue";

@Component({
    components: {
        Tool
    }
})
export default class Toolbox extends Vue {
    get toolboxStyle(): any {
        return {
            borderRight: `1px solid ${this.$store.getters.theme.tertiary}`
        };
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#toolbox {
    width: 64px;
    flex-shrink: 0;
    flex-direction: column;
}
</style>
