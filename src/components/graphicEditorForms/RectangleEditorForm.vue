<template>
    <div ref='root' :style='style.rectangleEditorForm'>
        <label for='x'>X</label>
        <input name='x' type='number' /><br />
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
import { computed, defineComponent, reactive } from 'vue';
import DeckComponent from '../generic/DeckComponent';

const RectangleEditorForm = defineComponent({
    setup: () => {
        const { root, store, baseTheme } = DeckComponent();
        const style = reactive({
            rectangleEditorForm: computed(() => ({
                height: '100%',
                width: '100%'
            }))
        });

        return {
            root,
            style
        };
    }
});

export default RectangleEditorForm;
</script>
