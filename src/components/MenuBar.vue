<template>
<div id='menu-bar'>
    <input id='deck-title' v-model='deckTitle' @keydown='handleKeydown' autocomplete='off' placeholder='Untitled'>
</div>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';
import { MUTATIONS, GETTERS } from '../store/types';
import { Getter, Mutation } from 'vuex-class';

@Component
export default class MenuBar extends Vue {
    @Getter private [GETTERS.DECK_TITLE]: string;
    @Mutation private [MUTATIONS.DECK_TITLE]: (deckTitle: string) => void;

    private get deckTitle(): string {
        return this[GETTERS.DECK_TITLE];
    }

    private set deckTitle(deckTitle: string) {
        this[MUTATIONS.DECK_TITLE](deckTitle);
    }

    private handleKeydown(event: KeyboardEvent): void {
        if (['Tab', 'Enter', 'Escape'].indexOf(event.key) !== -1) {
            (event.target as HTMLInputElement).blur();
        }
    }
}
</script>

<style lang='scss' scoped>
@import '../styles/application';

#menu-bar {
    height: 28px;
    flex-shrink: 0;
    box-sizing: border-box;
    border-bottom: 1px solid $color-tertiary;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: $font-body;
}

#deck-title {
    outline: none;
    border: none;
    text-align: center;
    font-family: $font-body;
    font-size: 14px;
    transition: 0.25s;
    height: 100%;
    background: transparent;

    &:hover {
        background: $color-secondary;
    }

    &:focus {
        background: $color-tertiary;
    }
}
</style>

