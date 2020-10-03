<template>
    <div ref='root' :style='style.ellipseEditorForm'>
        <NumberField :name='"x"' :label='"X"' :value='x' @deck-input='value => x = value' />
        <NumberField :name='"y"' :label='"Y"' :value='y' @deck-input='value => y = value' />
        <NumberField :name='"w"' :label='"W"' :value='width' @deck-input='value => width = value' :min='0' />
        <NumberField :name='"h"' :label='"H"' :value='height' @deck-input='value => height = value' :min='0' />
        <ToggleField :name='"l"' :label='"L"' :value='lockAspectRatio' @deck-input='value => lockAspectRatio = value' />
        <NumberField :name='"r"' :label='"R"' :value='rotation' @deck-input='value => rotation = value' />
        <NumberField :name='"s"' :label='"S"' :value='strokeWidth' @deck-input='value => strokeWidth = value' />
        <ColorField :name='"f"' :label='"F"' :value='fillColor' @deck-input='value => fillColor = value' />
        <ColorField :name='"c"' :label='"C"' :value='strokeColor' @deck-input='value => strokeColor = value' />
    </div>
</template>

<script lang='ts'>
import { EllipseStoreModel } from '@/store/types';
import Vector from '@/utilities/Vector';
import { computed, defineComponent, PropType, reactive, ref } from 'vue';
import DeckComponent from '../generic/DeckComponent';
import NumberField from '../generic/NumberField.vue';
import ColorField from '../generic/ColorField.vue';
import ToggleField from '../generic/ToggleField.vue';

const EllipseEditorForm = defineComponent({
    components: {
        NumberField,
        ColorField,
        ToggleField
    },
    props: {
        ellipse: { type: Object as PropType<EllipseStoreModel>, required: true },
        slideId: { type: String, required: true }
    },
    setup: props => {
        const { root, store } = DeckComponent();
        const style = reactive({
            ellipseEditorForm: computed(() => ({
                height: '100%',
                width: '100%'
            }))
        });

        const lockAspectRatio = ref(false);
        const x = computed({
            get: () => props.ellipse.center.x,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.ellipse, center: new Vector(value, props.ellipse.center.y) });
                store.mutations.broadcastSetX(props.slideId, props.ellipse.id, value);
            }
        });
        const y = computed({
            get: () => props.ellipse.center.y,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.ellipse, center: new Vector(props.ellipse.center.x, value) });
                store.mutations.broadcastSetY(props.slideId, props.ellipse.id, value);
            }
        });
        const width = computed({
            get: () => props.ellipse.width,
            set: value => {
                if (lockAspectRatio.value) {
                    const height = value * props.ellipse.height / props.ellipse.width;
                    store.mutations.setGraphic(props.slideId, { ...props.ellipse, width: value, height });
                    store.mutations.broadcastSetWidth(props.slideId, props.ellipse.id, value);
                    store.mutations.broadcastSetHeight(props.slideId, props.ellipse.id, height);
                } else {
                    store.mutations.setGraphic(props.slideId, { ...props.ellipse, width: value });
                    store.mutations.broadcastSetWidth(props.slideId, props.ellipse.id, value);
                }
            }
        });
        const height = computed({
            get: () => props.ellipse.height,
            set: value => {
                if (lockAspectRatio.value) {
                    const width = value * props.ellipse.width / props.ellipse.height;
                    store.mutations.setGraphic(props.slideId, { ...props.ellipse, width, height: value });
                    store.mutations.broadcastSetWidth(props.slideId, props.ellipse.id, width);
                    store.mutations.broadcastSetHeight(props.slideId, props.ellipse.id, value);
                } else {
                    store.mutations.setGraphic(props.slideId, { ...props.ellipse, height: value });
                    store.mutations.broadcastSetHeight(props.slideId, props.ellipse.id, value);
                }
            }
        });
        const rotation = computed({
            get: () => props.ellipse.rotation,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.ellipse, rotation: value });
                store.mutations.broadcastSetRotation(props.slideId, props.ellipse.id, value);
            }
        });
        const strokeWidth = computed({
            get: () => props.ellipse.strokeWidth,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.ellipse, strokeWidth: value });
                store.mutations.broadcastSetStrokeWidth(props.slideId, props.ellipse.id, value);
            }
        });
        const fillColor = computed({
            get: () => props.ellipse.fillColor,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.ellipse, fillColor: value });
                store.mutations.broadcastSetFillColor(props.slideId, props.ellipse.id, value);
            }
        });
        const strokeColor = computed({
            get: () => props.ellipse.strokeColor,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.ellipse, strokeColor: value });
                store.mutations.broadcastSetStrokeColor(props.slideId, props.ellipse.id, value);
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

export default EllipseEditorForm;
</script>
