<template>
<ellipse
    :cx='cx'
    :cy='cy'
    :rx='rx'
    :ry='ry'
    :style='style'
    :transform-origin='transformOrigin'
/>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { EllipseStoreModel } from '@/store/types';

const SvgEllipse = defineComponent({
    props: {
        target: { type: Object as PropType<EllipseStoreModel>, required: true }
    },
    setup: props => {
        const style: { [key: string]: string } = {
            fill: props.target.fillColor,
            'stroke-width': props.target.strokeWidth.toString(),
            stroke: props.target.strokeColor,
            transform: `rotate(${props.target.rotation}rad)`
        };

        return {
            cx: props.target.center.x,
            cy: props.target.center.y,
            rx: props.target.width / 2,
            ry: props.target.height / 2,
            style: Object.keys(style).map(key => `${key}:${style[key]}`).join(';'),
            transformOrigin: `${props.target.center.x + props.target.width / 2}px ${props.target.center.y + props.target.height / 2}px`
        };
    }
});

export default SvgEllipse;
</script>
