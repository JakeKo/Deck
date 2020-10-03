<template>
    <div ref='container' :style='style.container'>
        <label :for='name' :style='style.label' @click='() => inputValue = !inputValue'>{{label}}</label>
        <input :name='name' type='checkbox' v-model='inputValue' :style='style.field' />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue';
import { useHover, useStyle } from './core';

const ToggleField = defineComponent({
    props: {
        name: { type: String, required: true },
        label: { type: String, required: true },
        value: { type: Boolean, required: true }
    },
    setup: (props, { emit }) => {
        const { target: container, isHovered } = useHover();
        const { baseTheme, baseStyle } = useStyle();

        const inputValue = computed({
            get: () => props.value,
            set: value => {
                emit('deck-input', value);
                return value;
            }
        });
        const style = reactive({
            container: computed(() => ({
                width: '32px',
                height: '32px',
                transition: '0.25s',
                ...(isHovered.value ? baseStyle.value.cardHigher : baseStyle.value.cardHigh),
                background: inputValue.value ? baseTheme.value.color.primary.flush : baseTheme.value.color.base.highest
            })),
            label: computed(() => ({
                height: '100%',
                width: '100%',
                color: inputValue.value ? baseTheme.value.color.base.highest : baseTheme.value.color.primary.flush,
                ...baseStyle.value.fontLabel,
                ...baseStyle.value.flexRowCC
            })),
            field: computed(() => ({
                display: 'none'
            }))
        });

        return {
            container,
            style,
            inputValue
        };
    }
});

export default ToggleField;
</script>
