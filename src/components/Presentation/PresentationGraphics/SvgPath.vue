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
import { CurveStoreModel } from '@/store/types';

const SvgPath = defineComponent({
    props: {
        target: { type: Object as PropType<CurveStoreModel>, required: true }
    },
    setup: props => {
        const style: { [key: string]: string } = {
            transform: `rotate(${props.target.rotation}rad)`
        };

        const [origin, ...points] = props.target.points.slice(1, -1);

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
