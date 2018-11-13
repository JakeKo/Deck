/* tslint:disable */
<template>
<div id="toolbox" :style="toolboxStyle">
    <tool @tool-click="$store.commit('tool', 'cursor')"></tool>
    <tool @tool-click="$store.commit('tool', 'rectangle')"></tool>
    <tool @tool-click="$store.commit('tool', 'textbox')"></tool>
    <tool @tool-click="$store.dispatch('export')"></tool>
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
