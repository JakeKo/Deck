<template>   
<div :style='toolStyle' @click='$emit("tool-click")' @mouseover="onMouseOver" @mouseleave="onMouseLeave">
    <i :style='toolIconStyle' :class='icon' />
    {{name}}
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import { StyleCreator, BaseStyles } from '../styling/types';
import { Getter } from 'vuex-class';
import { GETTERS } from '../store/types';

export type ToolStyleProps = {};
export type ToolStyle = {
    tool: any;
    toolIcon: any;
    toolHover: any;
    activeTool: any;
    activeToolHover: any;
    activeToolIcon: any;
};
const toolStyle: StyleCreator<ToolStyleProps, ToolStyle> = ({ theme, base, props }) => ({
    tool: {
        ...base.flexColCC,
        ...base.fontLabel,
        width: '100%',
        cursor: 'pointer',
        padding: '8px 0',
        color: theme.color.achrocomp.lowest,
        background: theme.color.achro.highest,
        transition: '0.25s'
    },
    toolIcon: {
        fontSize: theme.text.body.size,
        color: theme.color.achrocomp.lowest,
        padding: '4px 0'
    },
    toolHover: {
        background: theme.color.achro.flush
    },
    activeTool: {
        color: theme.color.achro.highest,
        background: theme.color.primary.flush
    },
    activeToolHover: {
        background: theme.color.primary.lowest
    },
    activeToolIcon: {
        color: theme.color.achro.highest
    }
});

@Component
export default class Tool extends Vue {
    @Prop({ type: String, required: true }) private name!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Prop({ type: String, required: true }) private icon!: string;
    @Getter private [GETTERS.STYLE]: <T, U>(props: T, customStyles: StyleCreator<T, U>) => BaseStyles & U;
    private isHovered: boolean = false;

    private get componentStyle(): BaseStyles & ToolStyle {
        return this[GETTERS.STYLE]<ToolStyleProps, ToolStyle>({}, toolStyle);
    }

    private get toolStyle(): any {
        const style = this.componentStyle;
        return {
            ...style.tool,
            ...this.isHovered && style.toolHover,
            ...this.isActive && style.activeTool,
            ...this.isHovered && this.isActive && style.activeToolHover
        };
    }

    private get toolIconStyle(): any {
        const style = this.componentStyle;
        return {
            ...style.toolIcon,
            ...this.isActive && style.activeToolIcon
        };
    }

    private onMouseOver(): void {
        this.isHovered = true;
    }

    private onMouseLeave(): void {
        this.isHovered = false;
    }
}
</script>
