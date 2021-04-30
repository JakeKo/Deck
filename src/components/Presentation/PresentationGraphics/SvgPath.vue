<template>
<path
    :d='d'
    :stroke='stroke'
    :fill='fill'
    :stroke-width='strokeWidth'
    :style='style'
/>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { CurveSerialized } from '@/types';

const SvgPath = defineComponent({
    props: {
        target: { type: Object as PropType<CurveSerialized>, required: true }
    },
    setup: props => {
        const style: { [key: string]: string } = {
            transform: `rotate(${props.target.rotation}rad)`
        };

        const [origin, ...points] = props.target.anchors
            .map(anchor => [anchor.inHandle, anchor.point, anchor.outHandle])
            .flat()
            .slice(1, -1);

        return {
            d: `M ${origin.x},${origin.y} ${points.map(({ x, y }, i) => `${i % 3 === 0 ? ' C' : ''} ${x},${y}`)}`,
            stroke: props.target.strokeColor,
            fill: props.target.fillColor,
            strokeWidth: props.target.strokeWidth.toString(),
            style
        };
    }
});

export default SvgPath;
</script>
