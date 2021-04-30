<template>
    <div ref='root' :style='style.textboxEditorForm'>
        <div :style='style.row'>
            <TextField
                :name='"text"'
                :labelText='"TEXT"'
                :value='text'
                @deck-input='value => text = value'
            />
        </div>
        <div :style='style.row'>
            <NumberField
                :name='"x"'
                :labelText='"X"'
                :value='x'
                @deck-input='value => x = value'
            />
            <NumberField
                :name='"y"'
                :labelText='"Y"'
                :value='y'
                @deck-input='value => y = value'
            />
        </div>
        <div :style='style.row'>
            <NumberField
                :name='"width"'
                :labelText='"W"'
                :value='width'
                @deck-input='value => width = value'
                :min='0'
            />
            <NumberField
                :name='"height"'
                :labelText='"H"'
                :value='height'
                @deck-input='value => height = value'
                :min='0'
            />
            <ToggleField
                :name='"lock-aspect-ratio"'
                :labelIconOn='"fas fa-link"'
                :labelIconOff='"fas fa-unlink"'
                :value='lockAspectRatio'
                @deck-input='value => lockAspectRatio = value'
            />
        </div>
        <div :style='style.row'>
            <NumberField
                :name='"rotation"'
                :labelIcon='"fas fa-sync-alt"'
                :value='rotation'
                @deck-input='value => rotation = value'
            />
        </div>
    </div>
</template>

<script lang='ts'>
import { degToRad, radToDeg } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import { computed, defineComponent, PropType, reactive, ref } from 'vue';
import DeckComponent from '../generic/DeckComponent';
import { NumberField, ToggleField, TextField } from '../Core/Forms';
import { correctForRotationWhenChangingDimensions } from './utilities';
import { TextboxSerialized } from '@/types';
import { GRAPHIC_TYPES } from '@/rendering/types';

const TextboxEditorForm = defineComponent({
    components: {
        NumberField,
        ToggleField,
        TextField
    },
    props: {
        textbox: { type: Object as PropType<TextboxSerialized>, required: true },
        slideId: { type: String, required: true }
    },
    setup: props => {
        const { root, store, baseStyle } = DeckComponent();
        const style = reactive({
            textboxEditorForm: computed(() => ({
                boxSizing: 'border-box',
                padding: '4px'
            })),
            row: computed(() => ({
                ...baseStyle.value.flexRow
            })),
            column: computed(() => ({
                ...baseStyle.value.flexCol
            }))
        });

        const text = computed({
            get: () => props.textbox.text,
            set: value => {
                store.mutations.setProps(props.slideId, props.textbox.id, GRAPHIC_TYPES.TEXTBOX, { text: value });
            }
        });

        const lockAspectRatio = ref(false);
        const x = computed({
            get: () => props.textbox.origin.x,
            set: value => {
                store.mutations.setProps(props.slideId, props.textbox.id, GRAPHIC_TYPES.TEXTBOX, { origin: { x: value } });
            }
        });
        const y = computed({
            get: () => props.textbox.origin.y,
            set: value => {
                store.mutations.setProps(props.slideId, props.textbox.id, GRAPHIC_TYPES.TEXTBOX, { origin: { y: value } });
            }
        });
        const width = computed({
            get: () => props.textbox.dimensions.x,
            set: value => {
                const height = lockAspectRatio.value
                    ? value * props.textbox.dimensions.y / props.textbox.dimensions.x
                    : props.textbox.dimensions.y;
                const newOrigin = correctForRotationWhenChangingDimensions({
                    basePoint: V.from(props.textbox.origin),
                    initialDimensions: new V(props.textbox.dimensions.x, props.textbox.dimensions.y),
                    newDimensions: new V(value, height),
                    rotation: props.textbox.rotation
                });

                store.mutations.setProps(props.slideId, props.textbox.id, GRAPHIC_TYPES.TEXTBOX, {
                    origin: {
                        x: newOrigin.x === props.textbox.origin.x ? undefined : newOrigin.x,
                        y: newOrigin.y === props.textbox.origin.y ? undefined : newOrigin.y
                    },
                    dimensions: {
                        x: value,
                        y: height === props.textbox.dimensions.y ? undefined : height
                    }
                });
            }
        });
        const height = computed({
            get: () => props.textbox.dimensions.y,
            set: value => {
                const width = lockAspectRatio.value
                    ? value * props.textbox.dimensions.x / props.textbox.dimensions.y
                    : props.textbox.dimensions.x;
                const newOrigin = correctForRotationWhenChangingDimensions({
                    basePoint: V.from(props.textbox.origin),
                    initialDimensions: new V(props.textbox.dimensions.x, props.textbox.dimensions.y),
                    newDimensions: new V(width, value),
                    rotation: props.textbox.rotation
                });

                store.mutations.setProps(props.slideId, props.textbox.id, GRAPHIC_TYPES.TEXTBOX, {
                    origin: {
                        x: newOrigin.x === props.textbox.origin.x ? undefined : newOrigin.x,
                        y: newOrigin.y === props.textbox.origin.y ? undefined : newOrigin.y
                    },
                    dimensions: {
                        x: width === props.textbox.dimensions.x ? undefined : width,
                        y: value
                    }
                });
            }
        });
        const rotation = computed({
            get: () => radToDeg(props.textbox.rotation),
            set: value => {
                store.mutations.setProps(props.slideId, props.textbox.id, GRAPHIC_TYPES.TEXTBOX, { rotation: degToRad(value) });
            }
        });

        return {
            root,
            style,
            text,
            lockAspectRatio,
            x,
            y,
            width,
            height,
            rotation
        };
    }
});

export default TextboxEditorForm;
</script>
