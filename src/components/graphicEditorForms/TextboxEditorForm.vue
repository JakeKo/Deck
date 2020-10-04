<template>
    <div ref='root' :style='style.textboxEditorForm'>
        <NumberField :name='"x"' :label='"X"' :value='x' @deck-input='value => x = value' />
        <NumberField :name='"y"' :label='"Y"' :value='y' @deck-input='value => y = value' />
        <NumberField :name='"w"' :label='"W"' :value='width' @deck-input='value => width = value' :min='0' />
        <NumberField :name='"h"' :label='"H"' :value='height' @deck-input='value => height = value' :min='0' />
        <ToggleField :name='"l"' :label='"L"' :value='lockAspectRatio' @deck-input='value => lockAspectRatio = value' />
        <NumberField :name='"r"' :label='"R"' :value='rotation' @deck-input='value => rotation = value' />
    </div>
</template>

<script lang='ts'>
import { TextboxStoreModel } from '@/store/types';
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
        const { root, store } = DeckComponent();
        const style = reactive({
            textboxEditorForm: computed(() => ({
                height: '100%',
                width: '100%'
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
            get: () => props.textbox.rotation,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.textbox, rotation: value });
                store.mutations.broadcastSetRotation(props.slideId, props.textbox.id, value);
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
