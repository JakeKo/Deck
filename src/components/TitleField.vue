<template>
<input ref='root' :style="style.titleField" v-model='deckTitle' @keydown='handleKeydown' autocomplete='off' placeholder='Untitled'>
</template>

<script lang='ts'>
import DeckComponent from './generic/DeckComponent';
import { defineComponent, reactive, computed } from 'vue';

const TitleField = defineComponent({
    setup: () => {
        const { root, store, baseStyle, baseTheme, isFocused, isHovered } = DeckComponent();
        const style = reactive({
            titleField: computed(() => ({
                outline: 'none',
                border: 'none',
                textAlign: 'center',
                ...baseStyle.value.fontBody,
                transition: '0.25s',
                background: isFocused.value
                    ? baseTheme.value.color.base.flush
                    : isHovered.value ? baseTheme.value.color.base.higher : 'transparent'
            }))
        });
        const deckTitle = computed(() => ({
            get: store.getters.deckTitle,
            set: store.mutations.setDeckTitle
        }));

        function handleKeydown(event: KeyboardEvent): void {
            if (['Tab', 'Enter', 'Escape'].indexOf(event.key) !== -1) {
                (event.target as HTMLInputElement).blur();
            }
        }

        return {
            root,
            style,
            deckTitle,
            handleKeydown
        };
    }
});

export default TitleField;
</script>
