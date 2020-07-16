<template>
    <input :style="titleFieldStyle" v-model='deckTitle' @keydown='handleKeydown' autocomplete='off' placeholder='Untitled'>
</template>

<script lang='ts'>
import { Component } from 'vue-property-decorator';
import { MUTATIONS, GETTERS } from '../store/types';
import { Getter, Mutation } from 'vuex-class';
import { StyleCreator } from '../styling/types';
import DeckComponent from './generic/DeckComponent';

type StyleProps = {};
type Style = {
    titleField: any;
    titleFieldHover: any;
    titleFieldFocus: any;
};
const titleFieldStyle: StyleCreator<StyleProps, Style> = ({ theme, base, props }) => ({
    titleField: {
        outline: 'none',
        border: 'none',
        textAlign: 'center',
        ...base.fontBody,
        transition: '0.25s',
        background: 'transparent'
    },
    titleFieldHover: {
        background: theme.color.base.higher
    },
    titleFieldFocus: {
        background: theme.color.base.flush
    }
});

@Component
export default class TitleField extends DeckComponent<StyleProps, Style> {
    @Getter private [GETTERS.DECK_TITLE]: string;
    @Mutation private [MUTATIONS.DECK_TITLE]: (deckTitle: string) => void;

    private get deckTitle(): string {
        return this[GETTERS.DECK_TITLE];
    }

    private set deckTitle(deckTitle: string) {
        this[MUTATIONS.DECK_TITLE](deckTitle);
    }

    private get titleFieldStyle(): any {
        const style = this[GETTERS.STYLE]({}, titleFieldStyle);
        return {
            ...style.titleField,
            ...this.isHovered && style.titleFieldHover,
            ...this.isFocused && style.titleFieldFocus
        };
    }

    private handleKeydown(event: KeyboardEvent): void {
        if (['Tab', 'Enter', 'Escape'].indexOf(event.key) !== -1) {
            (event.target as HTMLInputElement).blur();
        }
    }
}
</script>
