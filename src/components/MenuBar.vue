<template>
<div :style="menuBarStyle">
    <title-field />
</div>
</template>

<script lang='ts'>
import { Component } from 'vue-property-decorator';
import { MUTATIONS, GETTERS } from '../store/types';
import { StyleCreator } from '../styling/types';
import DeckComponent from './generic/DeckComponent';
import TitleField from './TitleField.vue';

type StyleProps = {};
type Style = {
    menuBar: any;
};
const menuBarStyle: StyleCreator<StyleProps, Style> = ({ theme, base, props }) => ({
    menuBar: {
        height: '28px',
        flexShrink: '0',
        boxSizing: 'border-box',
        borderBottom: `1px solid ${theme.color.base.flush}`,
        background: theme.color.base.highest,
        ...base.fontBody,
        ...base.flexRowCC
    }
});

@Component({
    components: {
        TitleField
    }
})
export default class MenuBar extends DeckComponent<StyleProps, Style> {
    private get menuBarStyle(): any {
        const style = this[GETTERS.STYLE]({}, menuBarStyle);
        return style.menuBar;
    }
}
</script>
