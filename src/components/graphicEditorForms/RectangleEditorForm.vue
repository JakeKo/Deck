<template>
    <div ref='root' :style='style.rectangleEditorForm'>
        <NumberField :name='"x"' :label='"X"' :value='x' @deck-input='value => x = value' />
        <NumberField :name='"y"' :label='"Y"' :value='y' @deck-input='value => y = value' />
        <NumberField :name='"w"' :label='"W"' :value='width' @deck-input='value => width = value' />
        <NumberField :name='"h"' :label='"H"' :value='height' @deck-input='value => height = value' />
        <ToggleField :name='"l"' :label='"L"' :value='lockAspectRatio' @deck-input='value => lockAspectRatio = value' />
        <NumberField :name='"r"' :label='"R"' :value='rotation' @deck-input='value => rotation = value' />
        <NumberField :name='"s"' :label='"S"' :value='strokeWidth' @deck-input='value => strokeWidth = value' />
        <ColorField :name='"f"' :label='"F"' :value='fillColor' @deck-input='value => fillColor = value' />
        <ColorField :name='"c"' :label='"C"' :value='strokeColor' @deck-input='value => strokeColor = value' />
    </div>
</template>

<script lang='ts'>
import { RectangleStoreModel } from '@/store/types';
import Vector from '@/utilities/Vector';
import { computed, defineComponent, PropType, reactive, ref } from 'vue';
import DeckComponent from '../generic/DeckComponent';
import NumberField from '../generic/NumberField.vue';
import ColorField from '../generic/ColorField.vue';
import ToggleField from '../generic/ToggleField.vue';

const RectangleEditorForm = defineComponent({
    components: {
        NumberField,
        ColorField,
        ToggleField
    },
    props: {
        rectangle: { type: Object as PropType<RectangleStoreModel>, required: true },
        slideId: { type: String, required: true }
    },
    setup: props => {
        const { root, store } = DeckComponent();
        const style = reactive({
            rectangleEditorForm: computed(() => ({
                height: '100%',
                width: '100%'
            }))
        });

        const lockAspectRatio = ref(false);
        const x = computed({
            get: () => props.rectangle.origin.x,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.rectangle, origin: new Vector(value, props.rectangle.origin.y) });
                store.mutations.broadcastSetX(props.slideId, props.rectangle.id, value);
            }
        });
        const y = computed({
            get: () => props.rectangle.origin.y,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.rectangle, origin: new Vector(props.rectangle.origin.x, value) });
                store.mutations.broadcastSetY(props.slideId, props.rectangle.id, value);
            }
        });
        const width = computed({
            get: () => props.rectangle.width,
            set: value => {
                if (lockAspectRatio.value) {
                    const height = value * props.rectangle.height / props.rectangle.width;
                    store.mutations.setGraphic(props.slideId, { ...props.rectangle, width: value, height });
                    store.mutations.broadcastSetWidth(props.slideId, props.rectangle.id, value);
                    store.mutations.broadcastSetHeight(props.slideId, props.rectangle.id, height);
                } else {
                    store.mutations.setGraphic(props.slideId, { ...props.rectangle, width: value });
                    store.mutations.broadcastSetWidth(props.slideId, props.rectangle.id, value);
                }
            }
        });
        const height = computed({
            get: () => props.rectangle.height,
            set: value => {
                if (lockAspectRatio.value) {
                    const width = value * props.rectangle.width / props.rectangle.height;
                    store.mutations.setGraphic(props.slideId, { ...props.rectangle, width, height: value });
                    store.mutations.broadcastSetWidth(props.slideId, props.rectangle.id, width);
                    store.mutations.broadcastSetHeight(props.slideId, props.rectangle.id, value);
                } else {
                    store.mutations.setGraphic(props.slideId, { ...props.rectangle, height: value });
                    store.mutations.broadcastSetHeight(props.slideId, props.rectangle.id, value);
                }
            }
        });
        const rotation = computed({
            get: () => props.rectangle.rotation,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.rectangle, rotation: value });
                store.mutations.broadcastSetRotation(props.slideId, props.rectangle.id, value);
            }
        });
        const strokeWidth = computed({
            get: () => props.rectangle.strokeWidth,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.rectangle, strokeWidth: value });
                store.mutations.broadcastSetStrokeWidth(props.slideId, props.rectangle.id, value);
            }
        });
        const fillColor = computed({
            get: () => props.rectangle.fillColor,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.rectangle, fillColor: value });
                store.mutations.broadcastSetFillColor(props.slideId, props.rectangle.id, value);
            }
        });
        const strokeColor = computed({
            get: () => props.rectangle.strokeColor,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.rectangle, strokeColor: value });
                store.mutations.broadcastSetStrokeColor(props.slideId, props.rectangle.id, value);
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
            rotation,
            strokeWidth,
            strokeColor,
            fillColor
        };
    }
});

export default RectangleEditorForm;
</script>
