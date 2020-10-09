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
import Vector from '@/utilities/Vector';
import { computed, defineComponent, PropType, reactive, ref } from 'vue';
import DeckComponent from '../generic/DeckComponent';
import NumberField from '../generic/NumberField.vue';
import ToggleField from '../generic/ToggleField.vue';

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
                height: '100%',
                width: '100%'
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
                store.mutations.setGraphic(props.slideId, { ...props.textbox, origin: new Vector(value, props.textbox.origin.y) });
                store.mutations.broadcastSetX(props.slideId, props.textbox.id, value);
            }
        });
        const y = computed({
            get: () => props.textbox.origin.y,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.textbox, origin: new Vector(props.textbox.origin.x, value) });
                store.mutations.broadcastSetY(props.slideId, props.textbox.id, value);
            }
        });
        const width = computed({
            get: () => props.textbox.width,
            set: value => {
                if (lockAspectRatio.value) {
                    const height = value * props.textbox.height / props.textbox.width;
                    store.mutations.setGraphic(props.slideId, { ...props.textbox, width: value, height });
                    store.mutations.broadcastSetWidth(props.slideId, props.textbox.id, value);
                    store.mutations.broadcastSetHeight(props.slideId, props.textbox.id, height);
                } else {
                    store.mutations.setGraphic(props.slideId, { ...props.textbox, width: value });
                    store.mutations.broadcastSetWidth(props.slideId, props.textbox.id, value);
                }
            }
        });
        const height = computed({
            get: () => props.textbox.height,
            set: value => {
                if (lockAspectRatio.value) {
                    const width = value * props.textbox.width / props.textbox.height;
                    store.mutations.setGraphic(props.slideId, { ...props.textbox, width, height: value });
                    store.mutations.broadcastSetWidth(props.slideId, props.textbox.id, width);
                    store.mutations.broadcastSetHeight(props.slideId, props.textbox.id, value);
                } else {
                    store.mutations.setGraphic(props.slideId, { ...props.textbox, height: value });
                    store.mutations.broadcastSetHeight(props.slideId, props.textbox.id, value);
                }
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
