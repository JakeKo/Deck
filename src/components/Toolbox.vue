/* tslint:disable */
<template>
<div id="toolbox" :style="toolboxStyle">
    <tool :mount="() => $store.commit('tool', 'cursor')" :toolName="'cursor'" :icon="'fas fa-mouse-pointer'" :isActive="$store.getters.tool.name === 'cursor'"></tool>
    <tool :mount="() => $store.commit('tool', 'pencil')" :toolName="'pencil'" :icon="'fas fa-pen'" :isActive="$store.getters.tool.name === 'pencil'"></tool>
    <tool :mount="() => $store.commit('tool', 'rectangle')" :toolName="'rectangle'" :icon="'fas fa-square'" :isActive="$store.getters.tool.name === 'rectangle'"></tool>
    <tool :mount="() => $store.commit('tool', 'textbox')" :toolName="'textbox'" :icon="'fas fa-font'" :isActive="$store.getters.tool.name === 'textbox'"></tool>
    <tool :mount="() => $store.commit('zoom')" :toolName="'zoom'" :icon="'fas fa-search-plus'" :isActive="$store.getters.tool.name === 'zoom'"></tool>
    <tool :mount="() => $store.commit('unzoom')" :toolName="'unzoom'" :icon="'fas fa-search-minus'" :isActive="$store.getters.tool.name === 'unzoom'"></tool>
    <tool :mount="() => $store.dispatch('export')" :toolName="'export'" :icon="'fas fa-file-export'" :isActive="$store.getters.tool.name === 'export'"></tool>
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
            borderRight: `1px solid ${this.$store.getters.theme.tertiary}`,
            width: `${this.$store.getters.toolboxWidth}px`
        };
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#toolbox {
    flex-direction: column;
}
</style>
