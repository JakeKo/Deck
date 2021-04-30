<template>
<foreignObject
    :x='x'
    :y='y'
    :width='width'
    :height='height'
    :style='style'
    :transform-origin='transformOrigin'
>
    <p
        :width='width'
        :height='height'
        :style='textStyle'
    >
        {{text}}
    </p>
</foreignObject>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { TextboxSerialized } from '@/types';

const SvgTextbox = defineComponent({
    props: {
        target: { type: Object as PropType<TextboxSerialized>, required: true }
    },
    setup: props => {
        const style: { [key: string]: string } = {
            transform: `rotate(${props.target.rotation}rad)`
        };
        const textStyle: { [key: string]: string } = {
            fontSize: props.target.size.toString(),
            fontWeight: props.target.weight.toString(),
            fontFamily: props.target.font,
            margin: '0'
        };

        return {
            x: props.target.origin.x,
            y: props.target.origin.y,
            width: props.target.dimensions.x,
            height: props.target.dimensions.y,
            text: props.target.text,
            textStyle,
            style: Object.keys(style).map(key => `${key}:${style[key]}`).join(';'),
            transformOrigin: `${props.target.origin.x + props.target.dimensions.x / 2}px ${props.target.origin.y + props.target.dimensions.y / 2}px`
        };
    }
});

export default SvgTextbox;
</script>
