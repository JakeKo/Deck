<template>
    <div ref='container' :style='style.container'>
        <label :for='name' :style='style.label'>{{label}}</label>
        <input :name='name' type='number' v-model='inputValue' :style='style.field' ref='field' :min='min' :max='max' />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue';
import { useFocus, useHover, useStyle } from './core';

const NumberField = defineComponent({
    props: {
        name: { type: String, required: true },
        label: { type: String, required: true },
        value: { type: Number, required: true },
        min: { type: Number, required: false },
        max: { type: Number, required: false }
    },
    setup: (props, { emit }) => {
        const { target: container, isHovered } = useHover();
        const { target: field, isFocused } = useFocus();
        const { baseTheme, baseStyle } = useStyle();

        const style = reactive({
            container: computed(() => ({
                width: '96px',
                height: '32px',
                transition: '0.25s',
                ...(isHovered.value || isFocused.value ? baseStyle.value.cardHigher : baseStyle.value.cardHigh),
                ...baseStyle.value.flexRow
            })),
            label: computed(() => ({
                height: '100%',
                width: '32px',
                flexShrink: '0',
                background: baseTheme.value.color.primary.flush,
                color: baseTheme.value.color.base.highest,
                borderRadius: '4px 0 0 4px',
                ...baseStyle.value.fontLabel,
                ...baseStyle.value.flexRowCC
            })),
            field: computed(() => ({
                height: '100%',
                flexGrow: '1',
                minWidth: '0',
                textAlign: 'right',
                borderRadius: '0 4px 4px 0',
                ...baseStyle.value.fontInput,
                ...baseStyle.value.field
            }))
        });

        const inputValue = computed({
            get: () => props.value,
            set: (value: number | '') => {
                if (value !== '' && (props.min && props.min > value) && (props.max && props.max < value)) {
                    emit('deck-input', value);
                    return value;
                }
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
