<template>
    <div ref='container' :style='style.container'>
        <label :for='name' :style='style.label'>{{label}}</label>
        <input :name='name' type='number' v-model='inputValue' :style='style.field' ref='field' />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue';
import { useFocus, useHover, useStyle } from './core';

const NumberField = defineComponent({
    props: {
        name: { type: String, required: true },
        label: { type: String, required: true },
        value: { type: Number, required: true }
    },
    setup: (props, { emit }) => {
        const { target: container, isHovered } = useHover();
        const { target: field, isFocused } = useFocus();
        const { baseTheme, baseStyle } = useStyle();

        const style = reactive({
            container: computed(() => ({
                width: '96px',
                height: '32px',
                borderRadius: '4px',
                boxShadow: isHovered.value || isFocused.value
                    ? `0 0 8px 0 ${baseTheme.value.color.base.lowest}`
                    : `0 0 4px 0 ${baseTheme.value.color.base.lowest}`,
                ...baseStyle.value.flexRow,
                margin: '4px 0',
                transition: '0.25s'
            })),
            label: computed(() => ({
                height: '100%',
                width: '32px',
                flexShrink: '0',
                background: baseTheme.value.color.primary.flush,
                color: baseTheme.value.color.base.highest,
                ...baseStyle.value.fontLabel,
                ...baseStyle.value.flexRowCC,
                borderRadius: '4px 0 0 4px'
            })),
            field: computed(() => ({
                height: '100%',
                flexGrow: '1',
                minWidth: '0',
                textAlign: 'right',
                ...baseStyle.value.fontInput,
                border: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                borderRadius: '0 4px 4px 0',
                padding: '4px 8px'
            }))
        });

        const inputValue = computed({
            get: () => props.value,
            set: value => {
                emit('deck-input', value);
                return value;
            }
        });

        return {
            container,
            field,
            style,
            inputValue
        };
    }
});

export default NumberField;
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
