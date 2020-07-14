<template>   
<div :style='toolStyle' @click='$emit("tool-click")'>
    <i :style='toolIconStyle' :class='icon' />
    {{name}}
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import { StyleCreator, BaseStyles } from '../styling/types';
import { Getter } from 'vuex-class';
import { GETTERS } from '../store/types';
import DeckComponent from './DeckComponent';

// TODO: Consider implementing CSS type
export type StyleProps = {};
export type Style = {
    tool: any;
    toolIcon: any;
    toolHover: any;
    activeTool: any;
    activeToolHover: any;
    activeToolIcon: any;
};
const toolStyle: StyleCreator<StyleProps, Style> = ({ theme, base, props }) => ({
    tool: {
        ...base.flexColCC,
        ...base.fontLabel,
        width: '100%',
        cursor: 'pointer',
        padding: '8px 0',
        color: theme.color.basecomp.lowest,
        background: theme.color.base.highest,
        transition: '0.25s'
    },
    toolIcon: {
        fontSize: theme.text.body.size,
        color: theme.color.basecomp.lowest,
        padding: '4px 0'
    },
    toolHover: {
        background: theme.color.base.flush
    },
    activeTool: {
        color: theme.color.base.highest,
        background: theme.color.primary.flush
    },
    activeToolHover: {
        background: theme.color.primary.lowest
    },
    activeToolIcon: {
        color: theme.color.base.highest
    }
});

@Component
export default class Tool extends DeckComponent<StyleProps, Style> {
    @Prop({ type: String, required: true }) private name!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Prop({ type: String, required: true }) private icon!: string;

    private get toolStyle(): any {
        const style = this[GETTERS.STYLE]({}, toolStyle);
        return {
            ...style.tool,
            ...this.isHovered && style.toolHover,
            ...this.isActive && style.activeTool,
            ...this.isHovered && this.isActive && style.activeToolHover
        };
    }

    private get toolIconStyle(): any {
        const style = this[GETTERS.STYLE]({}, toolStyle);
        return {
            ...style.toolIcon,
            ...this.isActive && style.activeToolIcon
        };
    }
}
</script>
