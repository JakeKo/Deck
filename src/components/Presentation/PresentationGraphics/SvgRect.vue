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
import { RectangleSerialized } from '@/types';

const SvgRect = defineComponent({
    props: {
        target: { type: Object as PropType<RectangleSerialized>, required: true }
    },
    setup: props => {
        const style: { [key: string]: string } = {
            fill: props.target.fillColor,
            'stroke-width': props.target.strokeWidth.toString(),
            stroke: props.target.strokeColor,
            transform: `rotate(${props.target.rotation}rad)`
        };

        return {
            x: props.target.origin.x,
            y: props.target.origin.y,
            width: props.target.dimensions.x,
            height: props.target.dimensions.y,
            style: Object.keys(style).map(key => `${key}:${style[key]}`).join(';'),
            transformOrigin: `${props.target.origin.x + props.target.dimensions.x / 2}px ${props.target.origin.y + props.target.dimensions.y / 2}px`
        };
    }
});

export default SvgRect;
</script>
