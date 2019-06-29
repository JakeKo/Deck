<template>
<div id="menu-bar">
    <input id="deck-title" :value="deckTitle" @blur="deckTitle = $event.target.value" @keydown="$event.stopPropagation()" autocomplete="false">
</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class MenuBar extends Vue {
    get deckTitle(): string {
        return this.$store.getters.deckTitle === "" ? "Untitled" : this.$store.getters.deckTitle;
    }

    set deckTitle(deckTitle: string) {
        this.$store.commit("deckTitle", deckTitle);
    }
}
</script>

<style lang="scss" scoped>
@import "../styles/application";

#menu-bar {
    height: 32px;
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
    padding: 4px 0;
    font-family: $font-body;
    font-size: 14px;
    transition: 0.25s;

    &:focus {
        background: $color-tertiary;
    }
}
</style>

