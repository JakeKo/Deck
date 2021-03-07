<template>
    <div ref='container' :style='style.container'>
        <label :for='name' :style='style.label' @click='() => inputValue = !inputValue'>
            <i v-if='labelIconOn && labelIconOff' :class='inputValue ? labelIconOn : labelIconOff' />
            {{labelText && !(labelIconOn && labelIconOff) ? labelText : ''}}
        </label>
        <input :name='name' type='checkbox' v-model='inputValue' :style='style.field' />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue';
import { useHover, useStyle } from '../../generic/core';

const ToggleField = defineComponent({
    props: {
        name: { type: String, required: true },
        labelText: { type: String, required: false },
        labelIconOn: { type: String, required: false },
        labelIconOff: { type: String, required: false },
        value: { type: Boolean, required: true }
    },
    setup: (props, { emit }) => {
        const { target: container, isHovered } = useHover();
        const { baseTheme, baseStyle } = useStyle();

        if (props.labelText && props.labelIconOn && props.labelIconOff) {
            console.warn('Label text and label icon both provided to ToggleField, defaulting to label icon');
        } else if (!props.labelText && !props.labelIconOn && !props.labelIconOff) {
            console.error('Neither label text nor label icon provided to ToggleField, please provide one of these properties');
        }

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
                cursor: 'pointer',
                color: inputValue.value ? baseTheme.value.color.base.highest : baseTheme.value.color.basecomp.flush,
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
