/* tslint:disable */
<template>
<div id="toolbox" :style="toolboxStyle">    
    <div class="tool" @click="$store.commit('tool', 'cursor')">
        <div class="tool-icon" :style="toolIconStyle('cursor')"></div>
    </div>

    <div class="tool" @click="$store.commit('tool', 'rectangle')">
        <div class="tool-icon" :style="toolIconStyle('rectangle')"></div>
    </div>
    
    <div class="tool" @click="$store.commit('tool', 'textbox')">
        <div class="tool-icon" :style="toolIconStyle('textbox')"></div>
    </div>
    
    <div class="tool" @click="$store.commit('zoom')">
        <div class="tool-icon" :style="toolIconStyle('')"></div>
    </div>
    
    <div class="tool" @click="$store.commit('unzoom')">
        <div class="tool-icon" :style="toolIconStyle('')"></div>
    </div>
    
    <div class="tool" @click="$store.dispatch('export')">
        <div class="tool-icon" :style="toolIconStyle('')"></div>
    </div>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";

@Component
export default class Toolbox extends Vue {
    get toolboxStyle(): any {
        return {
            borderRight: `1px solid ${this.$store.getters.theme.tertiary}`,
            width: `${this.$store.getters.toolboxWidth}px`
        };
    }

    private toolIconStyle(toolName: string): any {
        return {
            background: this.$store.getters.tool.name === toolName ? "blue" : this.$store.getters.theme.tertiary
        };
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#toolbox {
    flex-direction: column;
}

.tool {
    width: 100%;
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.tool-icon {
    height: 36px;
    width: 36px;
    border-radius: 50%;
}
</style>
