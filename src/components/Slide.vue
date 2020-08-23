<template>
<div ref='root' :id='`slide_${id}`' :style='style.slide'></div>
</template>

<script lang='ts'>
import SVG from 'svg.js';
import SlideRenderer from '../rendering/SlideRenderer';
import SlideStateManager from '../utilities/SlideStateManager';
import DeckComponent from './generic/DeckComponent';
import { defineComponent, reactive, computed, onMounted } from 'vue';

type Props = {
    id: string;
    isActive: boolean;
    stateManager: SlideStateManager;
};
const Slide = defineComponent({
    setup: (props: Props) => {
        console.log(props);
        const { root, store, baseStyle } = DeckComponent();
        const style = reactive({
            slide: computed(() => ({
                minWidth: `${store.getters.rawViewbox.width}px`,
                minHeight: `${store.getters.rawViewbox.height}px`,
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

            const viewbox = store.getters.rawViewbox;
            const canvas = SVG(root.value.id).viewbox(viewbox.x, viewbox.y, viewbox.width, viewbox.height).style({ position: 'absolute', top: 0, left: 0 });
            const renderer = new SlideRenderer({
                stateManager: props.stateManager,
                canvas,
                rawViewbox: viewbox,
                croppedViewbox: store.getters.croppedViewbox,
                zoom: store.getters.editorZoomLevel
            });

            props.stateManager.setStore(store);
            props.stateManager.setRenderer(renderer);
        });

        return {
            root,
            style,
            id: props.id
        };
    }
});

export default Slide;
</script>
