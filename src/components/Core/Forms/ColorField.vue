<template>
    <div ref='container' :style='style.container'>
        <label :for='name' :style='style.label'>
            <i v-if='labelIcon' :class='labelIcon' />
            {{labelText && !labelIcon ? labelText : ''}}
        </label>
        <input :name='name' type='text' v-model='inputValue' :style='style.field' ref='field' autocomplete='off' />
        <div :style='style.preview'>
            <div :style='style.opacityBackground' />
            <div :style='style.splotch' />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue';
import { useFocus, useHover, useStyle } from '../../generic/core';

const ColorField = defineComponent({
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
            console.warn('Label text and label icon both provided to NumberField, defaulting to label icon');
        } else if (!props.labelText && !props.labelIcon) {
            console.error('Neither label text nor label icon provided to NumberField, please provide one of these properties');
        }

        const inputValue = computed({
            get: () => props.value,
            set: value => {
                if (/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value) || value === 'none' || value === 'transparent') {
                    emit('deck-input', value);
                    return value;
                }
            }
        });

        const style = reactive({
            container: computed(() => ({
                width: '128px',
                transition: '0.25s',
                ...(isHovered.value || isFocused.value ? baseStyle.value.cardHigher : baseStyle.value.cardHigh),
                ...baseStyle.value.flexColTC
            })),
            label: computed(() => ({
                backgroundColor: baseTheme.value.color.primary.flush,
                color: baseTheme.value.color.base.highest,
                width: '100%',
                height: '32px',
                borderRadius: '4px 4px 0 0',
                textAlign: 'center',
                ...baseStyle.value.fontLabel,
                ...baseStyle.value.flexRowCC
            })),
            field: computed(() => ({
                textAlign: 'center',
                borderRadius: '0 4px 4px 0',
                width: '100%',
                ...baseStyle.value.fontInput,
                ...baseStyle.value.field
            })),
            preview: computed(() => ({
                height: '72px',
                width: '104px',
                marginBottom: '12px',
                position: 'relative'
            })),
            opacityBackground: computed(() => ({
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: `linear-gradient(45deg, ${baseTheme.value.color.base.flush} 25%, transparent 25%), linear-gradient(-45deg, ${baseTheme.value.color.base.flush} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${baseTheme.value.color.base.flush} 75%), linear-gradient(-45deg, transparent 75%, ${baseTheme.value.color.base.flush} 75%)`,
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
                borderRadius: '4px'
            })),
            splotch: computed(() => ({
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '4px',
                backgroundColor: inputValue.value
            }))
        });

        return {
            container,
            field,
            style,
            inputValue
        };
    }
});

export default ColorField;
</script>
