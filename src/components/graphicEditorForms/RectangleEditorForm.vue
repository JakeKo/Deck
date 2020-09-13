<template>
    <div ref='root' :style='style.rectangleEditorForm'>
        <label for='x'>X</label>
        <input name='x' type='number' v-model='x' /><br />
        <label for='y'>Y</label>
        <input name='y' type='number' /><br />
        <label for='width'>Width</label>
        <input name='width' type='number' /><br />
        <label for='height'>Height</label>
        <input name='height' type='number' /><br />
        <label for='rotation'>Rotation</label>
        <input name='rotation' type='number' /><br />
        <label for='stroke-width'>Stroke Width</label>
        <input name='stroke-width' type='number' /><br />
        <label for='fill-color'>Fill Color</label>
        <input name='fill-color' type='text' /><br />
        <label for='stroke-color'>Stroke Color</label>
        <input name='stroke-color' type='text' /><br />
    </div>
</template>

<script lang='ts'>
import { RectangleStoreModel } from '@/store/types';
import Vector from '@/utilities/Vector';
import { computed, defineComponent, PropType, reactive } from 'vue';
import DeckComponent from '../generic/DeckComponent';

const RectangleEditorForm = defineComponent({
    props: {
        target: { type: Object as PropType<RectangleStoreModel>, required: true }
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
            get: () => props.target.origin.x,
            set: value => {
                const activeSlide = store.state.activeSlide;
                if (activeSlide === undefined) {
                    throw new Error('Slide is undefined when setting property of graphic');
                }

                const graphic: RectangleStoreModel = { ...props.target, origin: new Vector(value, props.target.origin.y) };
                store.mutations.setGraphic(activeSlide.id, graphic);
                store.mutations.broadcastSetGraphic(activeSlide.id, graphic);
            }
        });

        return {
            root,
            style,
            x
        };
    }
});

export default RectangleEditorForm;
</script>
