<template>
    <div ref='root' :style='style.curveEditorForm'>
        <NumberField :name='"r"' :label='"R"' :value='rotation' @deck-input='value => rotation = value' />
        <NumberField :name='"s"' :label='"S"' :value='strokeWidth' @deck-input='value => strokeWidth = value' />
        <ColorField :name='"f"' :label='"F"' :value='fillColor' @deck-input='value => fillColor = value' />
        <ColorField :name='"c"' :label='"C"' :value='strokeColor' @deck-input='value => strokeColor = value' />
    </div>
</template>

<script lang='ts'>
import { CurveStoreModel } from '@/store/types';
import { computed, defineComponent, PropType, reactive } from 'vue';
import DeckComponent from '../generic/DeckComponent';
import NumberField from '../generic/NumberField.vue';
import ColorField from '../generic/ColorField.vue';

const CurveEditorForm = defineComponent({
    components: {
        NumberField,
        ColorField
    },
    props: {
        curve: { type: Object as PropType<CurveStoreModel>, required: true },
        slideId: { type: String, required: true }
    },
    setup: props => {
        const { root, store } = DeckComponent();
        const style = reactive({
            curveEditorForm: computed(() => ({
                height: '100%',
                width: '100%'
            }))
        });

        const rotation = computed({
            get: () => props.curve.rotation,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.curve, rotation: value });
                store.mutations.broadcastSetRotation(props.slideId, props.curve.id, value);
            }
        });
        const strokeWidth = computed({
            get: () => props.curve.strokeWidth,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.curve, strokeWidth: value });
                store.mutations.broadcastSetStrokeWidth(props.slideId, props.curve.id, value);
            }
        });
        const fillColor = computed({
            get: () => props.curve.fillColor,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.curve, fillColor: value });
                store.mutations.broadcastSetFillColor(props.slideId, props.curve.id, value);
            }
        });
        const strokeColor = computed({
            get: () => props.curve.strokeColor,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.curve, strokeColor: value });
                store.mutations.broadcastSetStrokeColor(props.slideId, props.curve.id, value);
            }
        });

        return {
            root,
            style,
            rotation,
            strokeWidth,
            strokeColor,
            fillColor
        };
    }
});

export default CurveEditorForm;
</script>
