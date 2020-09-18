<template>
    <div ref='root' :style='style.rectangleEditorForm'>
        <label for='x'>X</label>
        <input name='x' type='number' v-model='x'/><br />
        <label for='y'>Y</label>
        <input name='y' type='number' v-model='y' /><br />
        <label for='width'>Width</label>
        <input name='width' type='number' v-model='width' /><br />
        <label for='height'>Height</label>
        <input name='height' type='number' v-model='height' /><br />
        <label for='rotation'>Rotation</label>
        <input name='rotation' type='number' v-model='rotation' /><br />
        <label for='stroke-width'>Stroke Width</label>
        <input name='stroke-width' type='number' v-model='strokeWidth' /><br />
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

const RectangleEditorForm = defineComponent({
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
