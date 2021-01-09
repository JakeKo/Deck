<template>
<path
    :d='d'
    :stroke='stroke'
    :fill='fill'
    :stroke-width='stroke-width'
    :style='style'
/>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { CurveStoreModel } from '@/store/types';

const PresentationSlide = defineComponent({
    props: {
        curve: { type: Object as PropType<CurveStoreModel>, required: true }
    },
    setup: props => {
        const style: { [key: string]: string } = {
            transform: `rotate(${props.curve.rotation}rad)`
        };

        const [origin, ...points] = props.curve.points.slice(1, -1);

        return {
            d: `M ${origin.x},${origin.y} ${points.map(({ x, y }, i) => `${i % 3 === 0 ? ' C' : ''} ${x},${y}`)}`,
            stroke: props.curve.strokeColor,
            fill: props.curve.fillColor,
            'stroke-width': props.curve.strokeWidth.toString(),
            style
        };
    }
});

export default PresentationSlide;
</script>
