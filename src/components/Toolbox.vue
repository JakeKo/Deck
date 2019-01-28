<template>
<div id="toolbox">
    <tool @click="$store.commit('tool', 'cursor')" :toolName="'cursor'" :icon="'fas fa-mouse-pointer'" :isActive="$store.getters.tool.name === 'cursor'"></tool>
    <tool @click="$store.commit('tool', 'pencil')" :toolName="'pencil'" :icon="'fas fa-pen'" :isActive="$store.getters.tool.name === 'pencil'"></tool>
    <tool @click="$store.commit('tool', 'pen')" :toolName="'pen'" :icon="'fas fa-pen-nib'" :isActive="$store.getters.tool.name === 'pen'"></tool>
    <tool @click="$store.commit('tool', 'rectangle')" :toolName="'rectangle'" :icon="'fas fa-square'" :isActive="$store.getters.tool.name === 'rectangle'"></tool>
    <tool @click="$store.commit('tool', 'ellipse')" :toolName="'ellipse'" :icon="'fas fa-circle'" :isActive="$store.getters.tool.name === 'ellipse'"></tool>
    <tool @click="$store.commit('tool', 'textbox')" :toolName="'text'" :icon="'fas fa-font'" :isActive="$store.getters.tool.name === 'textbox'"></tool>
    <tool @click="$store.dispatch('export')" :toolName="'export'" :icon="'fas fa-cloud-download-alt'" :isActive="false"></tool>
    <tool @click="$store.dispatch('save')" :toolName="'save'" :icon="'fas fa-save'" :isActive="false"></tool>
    <a href="https://github.com/JakeKo/Deck/issues/new/choose" target="blank" style="text-decoration: none">
        <tool :toolName="'feedback'" :icon="'fas fa-info'" :isActive="false"></tool>
    </a>
</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Tool from "./Tool.vue";

@Component({
    components: {
        Tool
    }
})
export default class Toolbox extends Vue { }
</script>

<style lang="scss" scoped>
@import "../styles/colors";

#toolbox {
    border-right: 1px solid $color-tertiary;
    flex-direction: column;
    flex-shrink: 0;
    width: 64px;
}
</style>
