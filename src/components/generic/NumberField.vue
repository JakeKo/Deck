<template>
    <div ref='container' :style='style.container'>
        <label :for='name' :style='style.label'>
            <i v-if='labelIcon' :class='labelIcon' />
            {{labelText && !labelIcon ? labelText : ''}}
        </label>
        <input :name='name' type='number' v-model='inputValue' :style='style.field' ref='field' :min='min' :max='max' />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue';
import { useFocus, useHover, useStyle } from './core';

const NumberField = defineComponent({
    props: {
        name: { type: String, required: true },
        labelText: { type: String, required: false },
        labelIcon: { type: String, required: false },
        value: { type: Number, required: true },
        min: { type: Number, required: false },
        max: { type: Number, required: false }
    },
    setup: (props, { emit }) => {
        const { target: container, isHovered } = useHover();
        const { target: field, isFocused } = useFocus();
        const { baseTheme, baseStyle } = useStyle();

        if (props.labelText && props.labelIcon) {
            console.warn('Label text and label icon both provided to NumberField, defaulting to label icon');
        } else if (!props.labelText && !props.labelIcon) {
            console.error('Neither label text nor label icon provided to NumberField, please provide one of these properties');
        }

        const style = reactive({
            container: computed(() => ({
                width: '128px',
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
                color: baseTheme.value.color.basecomp.flush,
                ...baseStyle.value.fontInput,
                ...baseStyle.value.field
            }))
        });

        const inputValue = computed({
            get: () => props.value,
            set: (value: number | string) => {
                if (value === '') {
                    return;
                }

                const valueAsNum = Number(value);
                if ((!props.min || props.min <= valueAsNum) && (!props.max || props.max >= valueAsNum)) {
                    emit('deck-input', valueAsNum);
                    return valueAsNum;
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
