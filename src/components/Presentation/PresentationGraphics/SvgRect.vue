<template>
<rect
    :x='x'
    :y='y'
    :width='width'
    :height='height'
    :style='style'
    :transform-origin='transformOrigin'
/>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { RectangleStoreModel } from '@/store/types';

const PresentationSlide = defineComponent({
    props: {
        rectangle: { type: Object as PropType<RectangleStoreModel>, required: true }
    },
    setup: props => {
        const style: { [key: string]: string } = {
            fill: props.rectangle.fillColor,
            'stroke-width': props.rectangle.strokeWidth.toString(),
            stroke: props.rectangle.strokeColor,
            transform: `rotate(${props.rectangle.rotation}rad)`
        };

        return {
            x: props.rectangle.origin.x,
            y: props.rectangle.origin.y,
            width: props.rectangle.width,
            height: props.rectangle.height,
            style: Object.keys(style).map(key => `${key}:${style[key]}`).join(';'),
            transformOrigin: `${props.rectangle.origin.x + props.rectangle.width / 2}px ${props.rectangle.origin.y + props.rectangle.height / 2}px`
        };
    }
});

export default PresentationSlide;
</script>
