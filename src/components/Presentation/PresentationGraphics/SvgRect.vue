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

const SvgRect = defineComponent({
    props: {
        target: { type: Object as PropType<RectangleStoreModel>, required: true }
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
            width: props.target.width,
            height: props.target.height,
            style: Object.keys(style).map(key => `${key}:${style[key]}`).join(';'),
            transformOrigin: `${props.target.origin.x + props.target.width / 2}px ${props.target.origin.y + props.target.height / 2}px`
        };
    }
});

export default SvgRect;
</script>
