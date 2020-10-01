<template>
    <div ref='root' :style='style.rectangleEditorForm'>
        <NumberField :name='"x"' :label='"X"' :value='x' @deck-input='value => x = value' />
        <NumberField :name='"y"' :label='"Y"' :value='y' @deck-input='value => y = value' />
        <NumberField :name='"w"' :label='"W"' :value='width' @deck-input='value => width = value' />
        <NumberField :name='"h"' :label='"H"' :value='height' @deck-input='value => height = value' />
        <NumberField :name='"r"' :label='"R"' :value='rotation' @deck-input='value => rotation = value' />
        <NumberField :name='"s"' :label='"S"' :value='strokeWidth' @deck-input='value => strokeWidth = value' />
        <label for='fill-color'>Fill Color</label>
        <input name='fill-color' type='text' v-model='fillColor' /><br />
        <label for='stroke-color'>Stroke Color</label>
        <input name='stroke-color' type='text' v-model='strokeColor' /><br />
    </div>
</template>

<script lang='ts'>
import { RectangleStoreModel } from '@/store/types';
import Vector from '@/utilities/Vector';
import { computed, defineComponent, PropType, reactive } from 'vue';
import DeckComponent from '../generic/DeckComponent';
import NumberField from '../generic/NumberField.vue';

const RectangleEditorForm = defineComponent({
    components: {
        NumberField
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

        const x = computed({
            get: () => props.rectangle.origin.x,
            set: value => {
                const graphic: RectangleStoreModel = { ...props.rectangle, origin: new Vector(value, props.rectangle.origin.y) };
                store.mutations.setGraphic(props.slideId, graphic);
                store.mutations.broadcastSetX(props.slideId, graphic.id, value);
            }
        });
        const y = computed({
            get: () => props.rectangle.origin.y,
            set: value => {
                const graphic: RectangleStoreModel = { ...props.rectangle, origin: new Vector(props.rectangle.origin.x, value) };
                store.mutations.setGraphic(props.slideId, graphic);
                store.mutations.broadcastSetY(props.slideId, graphic.id, value);
            }
        });
        const width = computed({
            get: () => props.rectangle.width,
            set: value => {
                const graphic: RectangleStoreModel = { ...props.rectangle, width: value };
                store.mutations.setGraphic(props.slideId, graphic);
                store.mutations.broadcastSetWidth(props.slideId, graphic.id, value);
            }
        });
        const height = computed({
            get: () => props.rectangle.height,
            set: value => {
                const graphic: RectangleStoreModel = { ...props.rectangle, height: value };
                store.mutations.setGraphic(props.slideId, graphic);
                store.mutations.broadcastSetHeight(props.slideId, graphic.id, value);
            }
        });
        const rotation = computed({
            get: () => props.rectangle.rotation,
            set: value => {
                const graphic: RectangleStoreModel = { ...props.rectangle, rotation: value };
                store.mutations.setGraphic(props.slideId, graphic);
                store.mutations.broadcastSetRotation(props.slideId, graphic.id, value);
            }
        });
        const strokeWidth = computed({
            get: () => props.rectangle.strokeWidth,
            set: value => {
                const graphic: RectangleStoreModel = { ...props.rectangle, strokeWidth: value };
                store.mutations.setGraphic(props.slideId, graphic);
                store.mutations.broadcastSetStrokeWidth(props.slideId, graphic.id, value);
            }
        });
        const fillColor = computed({
            get: () => props.rectangle.fillColor,
            set: value => {
                const graphic: RectangleStoreModel = { ...props.rectangle, fillColor: value };
                store.mutations.setGraphic(props.slideId, graphic);
                store.mutations.broadcastSetFillColor(props.slideId, graphic.id, value);
            }
        });
        const strokeColor = computed({
            get: () => props.rectangle.strokeColor,
            set: value => {
                const graphic: RectangleStoreModel = { ...props.rectangle, strokeColor: value };
                store.mutations.setGraphic(props.slideId, graphic);
                store.mutations.broadcastSetStrokeColor(props.slideId, graphic.id, value);
            }
        });

        return {
            root,
            style,
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
