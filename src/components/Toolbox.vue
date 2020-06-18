<template>
<div id='toolbox'>
    <tool v-for='t in tools'
        :key='t.key'
        @tool-click='t.clickHandler'
        :toolName='t.toolName'
        :icon='t.icon'
        :isActive='t.isActive'
    />
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import Tool from './Tool.vue';

@Component({
    components: {
        Tool
    }
})
export default class Toolbox extends Vue {
    @Prop({ type: String, required: true }) private toolName!: string;

    private tools = [
        {
            key: Math.random(),
            clickHandler: () => this.$store.commit('setActiveToolName', 'pointer'),
            toolName: 'cursor',
            icon: 'fas fa-mouse-pointer',
            isActive: this.toolName === 'cursor'
        },
        {
            key: Math.random(),
            clickHandler: () => this.$store.commit('setActiveToolName', 'rectangle'),
            toolName: 'rectangle',
            icon: 'fas fa-square',
            isActive: this.toolName === 'rectangle'
        },
        {
            key: Math.random(),
            clickHandler: () => this.$store.commit('setActiveToolName', 'curve'),
            toolName: 'curve',
            icon: 'fas fa-pen-nib',
            isActive: this.toolName === 'curve'
        }
    ];
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
