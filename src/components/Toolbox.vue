/* tslint:disable */
<template>
<div id="toolbox" :style="toolboxStyle">    
    <div class="tool" @click="$store.commit('tool', 'cursor')">
        <div class="tool-icon-wrapper" :style="toolIconWrapperStyle('cursor')">
            <i class="fas fa-mouse-pointer" :style="toolIconStyle('cursor')"></i>
        </div>
    </div>

    <div class="tool" @click="$store.commit('tool', 'rectangle')">
        <div class="tool-icon-wrapper" :style="toolIconWrapperStyle('rectangle')">
            <i class="fas fa-square" :style="toolIconStyle('rectangle')"></i>
        </div>
    </div>
    
    <div class="tool" @click="$store.commit('tool', 'textbox')">
        <div class="tool-icon-wrapper" :style="toolIconWrapperStyle('textbox')">
            <i class="fas fa-font" :style="toolIconStyle('textbox')"></i>
        </div>
    </div>
    
    <div class="tool" @click="$store.commit('zoom')">
        <div class="tool-icon-wrapper" :style="toolIconWrapperStyle('')">
            <i class="fas fa-search-plus" :style="toolIconStyle('')"></i>
        </div>
    </div>
    
    <div class="tool" @click="$store.commit('unzoom')">
        <div class="tool-icon-wrapper" :style="toolIconWrapperStyle('')">
            <i class="fas fa-search-minus" :style="toolIconStyle('')"></i>
        </div>
    </div>
    
    <div class="tool" @click="$store.dispatch('export')">
        <div class="tool-icon-wrapper" :style="toolIconWrapperStyle('')">
            <i class="fas fa-file-export" :style="toolIconStyle('')"></i>
        </div>
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

    private toolIconWrapperStyle(toolName: string): any {
        const isActive = this.$store.getters.tool.name === toolName;
        return {
            border: `3px solid ${isActive ? this.$store.getters.theme.information : this.$store.getters.theme.tertiary}`
        };
    }

    private toolIconStyle(toolName: string): any {
        const isActive = this.$store.getters.tool.name === toolName;
        return {
            color: isActive ? this.$store.getters.theme.information : this.$store.getters.theme.tertiary
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

.tool-icon-wrapper {
    height: 36px;
    width: 36px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
