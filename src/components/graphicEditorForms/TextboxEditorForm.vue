<template>
    <div ref='root' :style='style.textboxEditorForm'>
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
import NumberField from '../generic/NumberField.vue';
import ToggleField from '../generic/ToggleField.vue';
import { correctForRotationWhenChangingDimensions } from './utilities';

const TextboxEditorForm = defineComponent({
    components: {
        NumberField,
        ToggleField
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

        const lockAspectRatio = ref(false);
        const x = computed({
            get: () => props.textbox.origin.x,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.textbox, origin: new V(value, props.textbox.origin.y) });
                store.mutations.broadcastSetX(props.slideId, props.textbox.id, value);
            }
        });
        const y = computed({
            get: () => props.textbox.origin.y,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.textbox, origin: new V(props.textbox.origin.x, value) });
                store.mutations.broadcastSetY(props.slideId, props.textbox.id, value);
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

                store.mutations.setGraphic(props.slideId, { ...props.textbox, width: value, height, origin: newOrigin });
                store.mutations.broadcastSetWidth(props.slideId, props.textbox.id, value);
                store.mutations.broadcastSetHeight(props.slideId, props.textbox.id, height);
                store.mutations.broadcastSetX(props.slideId, props.textbox.id, newOrigin.x);
                store.mutations.broadcastSetY(props.slideId, props.textbox.id, newOrigin.y);
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

                store.mutations.setGraphic(props.slideId, { ...props.textbox, width, height: value, origin: newOrigin });
                store.mutations.broadcastSetWidth(props.slideId, props.textbox.id, width);
                store.mutations.broadcastSetHeight(props.slideId, props.textbox.id, value);
                store.mutations.broadcastSetX(props.slideId, props.textbox.id, newOrigin.x);
                store.mutations.broadcastSetY(props.slideId, props.textbox.id, newOrigin.y);
            }
        });
        const rotation = computed({
            get: () => radToDeg(props.textbox.rotation),
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.textbox, rotation: degToRad(value) });
                store.mutations.broadcastSetRotation(props.slideId, props.textbox.id, degToRad(value));
            }
        });

        return {
            root,
            style,
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
