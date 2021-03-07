<template>
    <div ref='container' :style='style.container'>
        <label :for='name' :style='style.label'>
            <i v-if='labelIcon' :class='labelIcon' />
            {{labelText && !labelIcon ? labelText : ''}}
        </label>
        <textarea :name='name' v-model='inputValue' :style='style.field' ref='field' />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue';
import { useFocus, useHover, useStyle } from '../../generic/core';

const TextField = defineComponent({
    props: {
        name: { type: String, required: true },
        labelText: { type: String, required: false },
        labelIcon: { type: String, required: false },
        value: { type: String, required: true }
    },
    setup: (props, { emit }) => {
        const { target: container, isHovered } = useHover();
        const { target: field, isFocused } = useFocus();
        const { baseTheme, baseStyle } = useStyle();

        if (props.labelText && props.labelIcon) {
            console.warn('Label text and label icon both provided to TextField, defaulting to label icon');
        } else if (!props.labelText && !props.labelIcon) {
            console.error('Neither label text nor label icon provided to TextField, please provide one of these properties');
        }

        const style = reactive({
            container: computed(() => ({
                width: 'calc(256px + 8px)',
                height: '256px',
                transition: '0.25s',
                ...(isHovered.value || isFocused.value ? baseStyle.value.cardHigher : baseStyle.value.cardHigh),
                ...baseStyle.value.flexCol
            })),
            label: computed(() => ({
                height: '32px',
                width: '100%',
                flexShrink: '0',
                background: baseTheme.value.color.primary.flush,
                color: baseTheme.value.color.base.highest,
                borderRadius: '4px 4px 0 0',
                ...baseStyle.value.fontLabel,
                ...baseStyle.value.flexRowCC
            })),
            field: computed(() => ({
                width: '100%',
                flexGrow: '1',
                minWidth: '0',
                borderRadius: '0 0 4px 4px',
                color: baseTheme.value.color.basecomp.flush,
                ...baseStyle.value.fontInput,
                ...baseStyle.value.field,
                resize: 'none'
            }))
        });

        const inputValue = computed({
            get: () => props.value,
            set: (value: string) => {
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

export default TextField;
</script>
