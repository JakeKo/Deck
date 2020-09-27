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
import { computed, defineComponent, reactive } from 'vue';
import DeckComponent from '../generic/DeckComponent';
import NumberField from '../generic/NumberField.vue';

const RectangleEditorForm = defineComponent({
    components: {
        NumberField
    },
    setup: () => {
        const { root, store } = DeckComponent();
        const style = reactive({
            rectangleEditorForm: computed(() => ({
                height: '100%',
                width: '100%'
            }))
        });

        const activeSlide = computed(() => {
            const activeSlide = store.state.activeSlide;
            if (activeSlide === undefined) {
                throw new Error('Some serious shenanigans are afoot');
            }

            return activeSlide;
        });
        const rectangle = computed(() => {
            const [key] = Object.keys(activeSlide.value.focusedGraphics);
            return activeSlide.value.focusedGraphics[key] as RectangleStoreModel;
        });

        const x = computed({
            get: () => rectangle.value.origin.x,
            set: value => {
                const graphic: RectangleStoreModel = { ...rectangle.value, origin: new Vector(value, rectangle.value.origin.y) };
                store.mutations.setGraphic(activeSlide.value.id, graphic);
                store.mutations.broadcastSetGraphic(activeSlide.value.id, graphic);
            }
        });
        const y = computed({
            get: () => rectangle.value.origin.y,
            set: value => {
                const graphic: RectangleStoreModel = { ...rectangle.value, origin: new Vector(rectangle.value.origin.x, value) };
                store.mutations.setGraphic(activeSlide.value.id, graphic);
                store.mutations.broadcastSetGraphic(activeSlide.value.id, graphic);
            }
        });
        const width = computed({
            get: () => rectangle.value.width,
            set: value => {
                const graphic: RectangleStoreModel = { ...rectangle.value, width: value };
                store.mutations.setGraphic(activeSlide.value.id, graphic);
                store.mutations.broadcastSetGraphic(activeSlide.value.id, graphic);
            }
        });
        const height = computed({
            get: () => rectangle.value.height,
            set: value => {
                const graphic: RectangleStoreModel = { ...rectangle.value, height: value };
                store.mutations.setGraphic(activeSlide.value.id, graphic);
                store.mutations.broadcastSetGraphic(activeSlide.value.id, graphic);
            }
        });
        const rotation = computed({
            get: () => rectangle.value.rotation,
            set: value => {
                const graphic: RectangleStoreModel = { ...rectangle.value, rotation: value };
                store.mutations.setGraphic(activeSlide.value.id, graphic);
                store.mutations.broadcastSetGraphic(activeSlide.value.id, graphic);
            }
        });
        const strokeWidth = computed({
            get: () => rectangle.value.strokeWidth,
            set: value => {
                const graphic: RectangleStoreModel = { ...rectangle.value, strokeWidth: value };
                store.mutations.setGraphic(activeSlide.value.id, graphic);
                store.mutations.broadcastSetGraphic(activeSlide.value.id, graphic);
            }
        });
        const fillColor = computed({
            get: () => rectangle.value.fillColor,
            set: value => {
                const graphic: RectangleStoreModel = { ...rectangle.value, fillColor: value };
                store.mutations.setGraphic(activeSlide.value.id, graphic);
                store.mutations.broadcastSetGraphic(activeSlide.value.id, graphic);
            }
        });
        const strokeColor = computed({
            get: () => rectangle.value.strokeColor,
            set: value => {
                const graphic: RectangleStoreModel = { ...rectangle.value, strokeColor: value };
                store.mutations.setGraphic(activeSlide.value.id, graphic);
                store.mutations.broadcastSetGraphic(activeSlide.value.id, graphic);
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
