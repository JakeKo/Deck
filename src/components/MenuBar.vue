<template>
<div :style="menuBarStyle">
    <input :style="deckTitleStyle" v-model='deckTitle' @keydown='handleKeydown' autocomplete='off' placeholder='Untitled'>
</div>
</template>

<script lang='ts'>
import { Component } from 'vue-property-decorator';
import { MUTATIONS, GETTERS } from '../store/types';
import { Getter, Mutation } from 'vuex-class';
import { StyleCreator } from '../styling/types';
import DeckComponent from './generic/DeckComponent';

type StyleProps = {};
type Style = {
    menuBar: any;
    deckTitle: any;
    deckTitleHover: any;
    deckTitleFocus: any;
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
    },
    deckTitle: {
        outline: 'none',
        border: 'none',
        textAlign: 'center',
        ...base.fontBody,
        transition: '0.25s',
        background: 'transparent'
    },
    deckTitleHover: {
        background: theme.color.base.higher
    },
    deckTitleFocus: {
        background: theme.color.base.flush
    }
});

@Component
export default class MenuBar extends DeckComponent<StyleProps, Style> {
    @Getter private [GETTERS.DECK_TITLE]: string;
    @Mutation private [MUTATIONS.DECK_TITLE]: (deckTitle: string) => void;

    private get deckTitle(): string {
        return this[GETTERS.DECK_TITLE];
    }

    private set deckTitle(deckTitle: string) {
        this[MUTATIONS.DECK_TITLE](deckTitle);
    }

    private get menuBarStyle(): any {
        const style = this[GETTERS.STYLE]({}, menuBarStyle);
        return style.menuBar;
    }

    private get deckTitleStyle(): any {
        const style = this[GETTERS.STYLE]({}, menuBarStyle);
        return style.deckTitle;
    }

    private handleKeydown(event: KeyboardEvent): void {
        if (['Tab', 'Enter', 'Escape'].indexOf(event.key) !== -1) {
            (event.target as HTMLInputElement).blur();
        }
    }
}
</script>
