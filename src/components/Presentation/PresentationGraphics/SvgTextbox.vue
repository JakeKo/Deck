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
import { TextboxStoreModel } from '@/store/types';

const SvgTextbox = defineComponent({
    props: {
        target: { type: Object as PropType<TextboxStoreModel>, required: true }
    },
    setup: props => {
        const style: { [key: string]: string } = {
            transform: `rotate(${props.target.rotation}rad)`
        };
        const textStyle: { [key: string]: string } = {
            fontSize: props.target.size.toString(),
            fontWeight: props.target.width.toString(),
            fontFamily: props.target.font,
            margin: '0'
        };

        return {
            x: props.target.origin.x,
            y: props.target.origin.y,
            width: props.target.width,
            height: props.target.height,
            text: props.target.text,
            textStyle,
            style: Object.keys(style).map(key => `${key}:${style[key]}`).join(';'),
            transformOrigin: `${props.target.origin.x + props.target.width / 2}px ${props.target.origin.y + props.target.height / 2}px`
        };
    }
});

export default SvgTextbox;
</script>
