<template>
<div ref='root' :id='`slide_${id}`' :style='style.slide'></div>
</template>

<script lang='ts'>
import SVG from 'svg.js';
import SlideRenderer from '../rendering/SlideRenderer';
import SlideStateManager from '../utilities/SlideStateManager';
import DeckComponent from './generic/DeckComponent';
import { defineComponent, reactive, computed, onMounted } from 'vue';

const Slide = defineComponent({
    props: {
        id: { type: String, required: true },
        isActive: { type: Boolean, required: true },
        stateManager: { type: SlideStateManager, required: true }
    },
    setup: props => {
        const { root, store, baseStyle } = DeckComponent();
        const style = reactive({
            slide: computed(() => ({
                minWidth: `${store.rawViewbox.value.width}px`,
                minHeight: `${store.rawViewbox.value.height}px`,
                ...baseStyle.value.flexRowCC,
                display: props.isActive ? 'flex' : 'none',
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                position: 'relative'
            }))
        });

        onMounted(() => {
            if (root.value === undefined) {
                throw new Error('Root ref not specified.');
            }

            const viewbox = store.rawViewbox.value;
            const canvas = SVG(root.value.id).viewbox(viewbox.x, viewbox.y, viewbox.width, viewbox.height).style({ position: 'absolute', top: 0, left: 0 });
            const renderer = new SlideRenderer({
                stateManager: props.stateManager,
                canvas,
                rawViewbox: viewbox,
                croppedViewbox: store.croppedViewbox.value,
                zoom: store.editorZoomLevel.value
            });

            props.stateManager.setStore(store);
            props.stateManager.setRenderer(renderer);
        });

        return {
            root,
            style
        };
    }
});

export default Slide;
</script>
