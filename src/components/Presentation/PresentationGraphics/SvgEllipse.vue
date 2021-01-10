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
        ellipse: { type: Object as PropType<EllipseStoreModel>, required: true }
    },
    setup: props => {
        const style: { [key: string]: string } = {
            fill: props.ellipse.fillColor,
            'stroke-width': props.ellipse.strokeWidth.toString(),
            stroke: props.ellipse.strokeColor,
            transform: `rotate(${props.ellipse.rotation}rad)`
        };

        return {
            cx: props.ellipse.center.x,
            cy: props.ellipse.center.y,
            rx: props.ellipse.width / 2,
            ry: props.ellipse.height / 2,
            style: Object.keys(style).map(key => `${key}:${style[key]}`).join(';'),
            transformOrigin: `${props.ellipse.center.x + props.ellipse.width / 2}px ${props.ellipse.center.y + props.ellipse.height / 2}px`
        };
    }
});

export default SvgEllipse;
</script>
