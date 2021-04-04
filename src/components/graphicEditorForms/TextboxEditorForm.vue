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
import { TextboxStoreModel } from '@/store/types';
import { degToRad, radToDeg } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import { computed, defineComponent, PropType, reactive, ref } from 'vue';
import DeckComponent from '../generic/DeckComponent';
import { NumberField, ToggleField, TextField } from '../Core/Forms';
import { correctForRotationWhenChangingDimensions } from './utilities';

const TextboxEditorForm = defineComponent({
    components: {
        NumberField,
        ToggleField,
        TextField
    },
    props: {
        textbox: { type: Object as PropType<TextboxStoreModel>, required: true },
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
                store.mutations.setProps(props.slideId, props.textbox.id, props.textbox.type, { text: value });
            }
        });

        const lockAspectRatio = ref(false);
        const x = computed({
            get: () => props.textbox.origin.x,
            set: value => {
                store.mutations.setProps(props.slideId, props.textbox.id, props.textbox.type, { origin: { x: value } });
            }
        });
        const y = computed({
            get: () => props.textbox.origin.y,
            set: value => {
                store.mutations.setProps(props.slideId, props.textbox.id, props.textbox.type, { origin: { y: value } });
            }
        });
        const width = computed({
            get: () => props.textbox.width,
            set: value => {
                const height = lockAspectRatio.value
                    ? value * props.textbox.height / props.textbox.width
                    : props.textbox.height;
                const newOrigin = correctForRotationWhenChangingDimensions({
                    basePoint: props.textbox.origin,
                    initialDimensions: new V(props.textbox.width, props.textbox.height),
                    newDimensions: new V(value, height),
                    rotation: props.textbox.rotation
                });

                store.mutations.setProps(props.slideId, props.textbox.id, props.textbox.type, {
                    origin: {
                        x: newOrigin.x === props.textbox.origin.x ? undefined : newOrigin.x,
                        y: newOrigin.y === props.textbox.origin.y ? undefined : newOrigin.y
                    },
                    dimensions: {
                        x: value,
                        y: height === props.textbox.height ? undefined : height
                    }
                });
            }
        });
        const height = computed({
            get: () => props.textbox.height,
            set: value => {
                const width = lockAspectRatio.value
                    ? value * props.textbox.width / props.textbox.height
                    : props.textbox.width;
                const newOrigin = correctForRotationWhenChangingDimensions({
                    basePoint: props.textbox.origin,
                    initialDimensions: new V(props.textbox.width, props.textbox.height),
                    newDimensions: new V(width, value),
                    rotation: props.textbox.rotation
                });

                store.mutations.setProps(props.slideId, props.textbox.id, props.textbox.type, {
                    origin: {
                        x: newOrigin.x === props.textbox.origin.x ? undefined : newOrigin.x,
                        y: newOrigin.y === props.textbox.origin.y ? undefined : newOrigin.y
                    },
                    dimensions: {
                        x: width === props.textbox.width ? undefined : width,
                        y: value
                    }
                });
            }
        });
        const rotation = computed({
            get: () => radToDeg(props.textbox.rotation),
            set: value => {
                store.mutations.setProps(props.slideId, props.textbox.id, props.textbox.type, { rotation: degToRad(value) });
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
