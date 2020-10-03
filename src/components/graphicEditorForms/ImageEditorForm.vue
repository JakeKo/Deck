<template>
    <div ref='root' :style='style.imageEditorForm'>
        <NumberField :name='"x"' :label='"X"' :value='x' @deck-input='value => x = value' />
        <NumberField :name='"y"' :label='"Y"' :value='y' @deck-input='value => y = value' />
        <NumberField :name='"w"' :label='"W"' :value='width' @deck-input='value => width = value' :min='0' />
        <NumberField :name='"h"' :label='"H"' :value='height' @deck-input='value => height = value' :min='0' />
        <NumberField :name='"r"' :label='"R"' :value='rotation' @deck-input='value => rotation = value' />
        <NumberField :name='"s"' :label='"S"' :value='strokeWidth' @deck-input='value => strokeWidth = value' />
        <ColorField :name='"c"' :label='"C"' :value='strokeColor' @deck-input='value => strokeColor = value' />
    </div>
</template>

<script lang='ts'>
import { ImageStoreModel } from '@/store/types';
import Vector from '@/utilities/Vector';
import { computed, defineComponent, PropType, reactive } from 'vue';
import DeckComponent from '../generic/DeckComponent';
import NumberField from '../generic/NumberField.vue';
import ColorField from '../generic/ColorField.vue';

const ImageEditorForm = defineComponent({
    components: {
        NumberField,
        ColorField
    },
    props: {
        image: { type: Object as PropType<ImageStoreModel>, required: true },
        slideId: { type: String, required: true }
    },
    setup: props => {
        const { root, store } = DeckComponent();
        const style = reactive({
            imageEditorForm: computed(() => ({
                height: '100%',
                width: '100%'
            }))
        });

        const x = computed({
            get: () => props.image.origin.x,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.image, origin: new Vector(value, props.image.origin.y) });
                store.mutations.broadcastSetX(props.slideId, props.image.id, value);
            }
        });
        const y = computed({
            get: () => props.image.origin.y,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.image, origin: new Vector(props.image.origin.x, value) });
                store.mutations.broadcastSetY(props.slideId, props.image.id, value);
            }
        });
        const width = computed({
            get: () => props.image.width,
            set: value => {
                const height = value * props.image.height / props.image.width;
                store.mutations.setGraphic(props.slideId, { ...props.image, width: value, height });
                store.mutations.broadcastSetWidth(props.slideId, props.image.id, value);
                store.mutations.broadcastSetHeight(props.slideId, props.image.id, height);
            }
        });
        const height = computed({
            get: () => props.image.height,
            set: value => {
                const width = value * props.image.width / props.image.height;
                store.mutations.setGraphic(props.slideId, { ...props.image, width, height: value });
                store.mutations.broadcastSetWidth(props.slideId, props.image.id, width);
                store.mutations.broadcastSetHeight(props.slideId, props.image.id, value);
            }
        });
        const rotation = computed({
            get: () => props.image.rotation,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.image, rotation: value });
                store.mutations.broadcastSetRotation(props.slideId, props.image.id, value);
            }
        });
        const strokeWidth = computed({
            get: () => props.image.strokeWidth,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.image, strokeWidth: value });
                store.mutations.broadcastSetStrokeWidth(props.slideId, props.image.id, value);
            }
        });
        const strokeColor = computed({
            get: () => props.image.strokeColor,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.image, strokeColor: value });
                store.mutations.broadcastSetStrokeColor(props.slideId, props.image.id, value);
            }
        });

        return {
            root,
            style,
            x,
            y,
            width,
            height,
            rotation,
            strokeWidth,
            strokeColor
        };
    }
});

export default ImageEditorForm;
</script>
