<template>
<div id='menu-bar'>
    <input id='deck-title' v-model='deckTitle' @keydown='handleKeydown' autocomplete='off' placeholder='Untitled'>
</div>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class MenuBar extends Vue {
    get deckTitle(): string {
        return this.$store.getters.deckTitle;
    }

    set deckTitle(deckTitle: string) {
        this.$store.commit('deckTitle', deckTitle);
    }

    private handleKeydown(event: KeyboardEvent): void {
        // Prevent propagation so pressing 'Delete' or 'Backspace' won't remove graphics from the active slide
        // TODO: Devise better way to handle removing graphics such that graphics are only removed if a delete-ish key is pressed while the editor is 'focused'
        event.stopPropagation();

        // Submit the input field if 'Enter' is pressed
        if (['Tab', 'Enter'].indexOf(event.key) !== -1) {
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

