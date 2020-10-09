<template>
    <div ref='root' :style='style.imageEditorForm'>
        <div :style='style.row'>
            <NumberField
                :name='"x"'
                :labelText='"X"'
                :value='x'
                @deck-input='value => x = value'
            />
            <NumberField
                :name='"y"'
                :labelText='"Y"'
                :value='y'
                @deck-input='value => y = value'
            />
        </div>
        <div :style='style.row'>
            <NumberField
                :name='"width"'
                :labelText='"W"'
                :value='width'
                @deck-input='value => width = value'
                :min='0'
            />
            <NumberField
                :name='"height"'
                :labelText='"H"'
                :value='height'
                @deck-input='value => height = value'
                :min='0'
            />
        </div>
        <div :style='style.row'>
            <NumberField
                :name='"rotation"'
                :labelIcon='"fas fa-sync-alt"'
                :value='rotation'
                @deck-input='value => rotation = value'
            />
        </div>
    </div>
</template>

<script lang='ts'>
import { ImageStoreModel } from '@/store/types';
import { degToRad, radToDeg } from '@/utilities/utilities';
import Vector from '@/utilities/Vector';
import { computed, defineComponent, PropType, reactive } from 'vue';
import DeckComponent from '../generic/DeckComponent';
import NumberField from '../generic/NumberField.vue';

const ImageEditorForm = defineComponent({
    components: {
        NumberField
    },
    props: {
        image: { type: Object as PropType<ImageStoreModel>, required: true },
        slideId: { type: String, required: true }
    },
    setup: props => {
        const { root, store, baseStyle } = DeckComponent();
        const style = reactive({
            imageEditorForm: computed(() => ({
                height: '100%',
                width: '100%'
            })),
            row: computed(() => ({
                ...baseStyle.value.flexRow
            })),
            column: computed(() => ({
                ...baseStyle.value.flexCol
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
            get: () => radToDeg(props.image.rotation),
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.image, rotation: degToRad(value) });
                store.mutations.broadcastSetRotation(props.slideId, props.image.id, degToRad(value));
            }
        });

        return {
            root,
            style,
            x,
            y,
            width,
            height,
            rotation
        };
    }
});

export default ImageEditorForm;
</script>
