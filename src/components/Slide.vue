<template>
<div ref='root' :id='`slide_${slide.id}`' :style='style.slide'></div>
</template>

<script lang='ts'>
import SVG from 'svg.js';
import SlideRenderer from '../rendering/SlideRenderer';
import { Slide as SlideModel } from '@/store/types';
import DeckComponent from './generic/DeckComponent';
import { defineComponent, reactive, computed, onMounted, PropType } from 'vue';
import { graphicStoreModelToGraphicRenderer } from '@/utilities/parsing/renderer';

const Slide = defineComponent({
    props: {
        slide: { type: Object as PropType<SlideModel>, required: true }
    },
    setup: props => {
        const { root, store, baseStyle } = DeckComponent();
        const style = reactive({
            slide: computed(() => ({
                minWidth: `${store.rawViewbox.value.width}px`,
                minHeight: `${store.rawViewbox.value.height}px`,
                ...baseStyle.value.flexRowCC,
                display: props.slide.isActive ? 'flex' : 'none',
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
                stateManager: props.slide.stateManager,
                canvas,
                rawViewbox: viewbox,
                croppedViewbox: store.croppedViewbox.value,
                zoom: store.editorZoomLevel.value
            });

            Object.values(props.slide.graphics)
                .map(graphic => graphicStoreModelToGraphicRenderer(graphic, renderer))
                .forEach(graphic => {
                    console.log(graphic);
                    renderer.setGraphic(graphic);
                    renderer.getGraphic(graphic.id).render();
                });

            props.slide.stateManager.setStore(store);
            props.slide.stateManager.setRenderer(renderer);
        });

        return {
            root,
            style
        };
    }
});

export default Slide;
</script>
