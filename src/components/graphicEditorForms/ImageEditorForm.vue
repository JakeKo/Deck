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
import { degToRad, radToDeg, round } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import { computed, defineComponent, PropType, reactive } from 'vue';
import DeckComponent from '../generic/DeckComponent';
import { NumberField } from '../Core/Forms';
import { correctForRotationWhenChangingDimensions } from './utilities';
import { ImageSerialized } from '@/types';
import { GRAPHIC_TYPES } from '@/rendering/types';

const ImageEditorForm = defineComponent({
    components: {
        NumberField
    },
    props: {
        image: { type: Object as PropType<ImageSerialized>, required: true },
        slideId: { type: String, required: true }
    },
    setup: props => {
        const { root, store, baseStyle } = DeckComponent();
        const style = reactive({
            imageEditorForm: computed(() => ({
                boxSizing: 'border-box',
                padding: '4px'
            })),
            row: computed(() => ({
                ...baseStyle.value.flexRow
            })),
            column: computed(() => ({
                ...baseStyle.value.flexCol
            }))
        });

        const x = computed({
            get: () => round(props.image.origin.x, 1E-3),
            set: value => {
                store.mutations.setProps(props.slideId, props.image.id, GRAPHIC_TYPES.IMAGE, { origin: { x: value } });
            }
        });
        const y = computed({
            get: () => round(props.image.origin.y, 1E-3),
            set: value => {
                store.mutations.setProps(props.slideId, props.image.id, GRAPHIC_TYPES.IMAGE, { origin: { y: value } });
            }
        });
        const width = computed({
            get: () => round(props.image.dimensions.x, 1E-3),
            set: value => {
                const height = value * props.image.dimensions.y / props.image.dimensions.x;
                const newOrigin = correctForRotationWhenChangingDimensions({
                    basePoint: V.from(props.image.origin),
                    initialDimensions: new V(props.image.dimensions.x, props.image.dimensions.y),
                    newDimensions: new V(value, height),
                    rotation: props.image.rotation
                });

                store.mutations.setProps(props.slideId, props.image.id, GRAPHIC_TYPES.IMAGE, {
                    origin: {
                        x: newOrigin.x === props.image.origin.x ? undefined : newOrigin.x,
                        y: newOrigin.y === props.image.origin.y ? undefined : newOrigin.y
                    },
                    dimensions: {
                        x: value,
                        y: height === props.image.dimensions.y ? undefined : height
                    }
                });
            }
        });
        const height = computed({
            get: () => round(props.image.dimensions.y, 1E-3),
            set: value => {
                const width = value * props.image.dimensions.x / props.image.dimensions.y;
                const newOrigin = correctForRotationWhenChangingDimensions({
                    basePoint: V.from(props.image.origin),
                    initialDimensions: new V(props.image.dimensions.x, props.image.dimensions.y),
                    newDimensions: new V(width, value),
                    rotation: props.image.rotation
                });

                store.mutations.setProps(props.slideId, props.image.id, GRAPHIC_TYPES.IMAGE, {
                    origin: {
                        x: newOrigin.x === props.image.origin.x ? undefined : newOrigin.x,
                        y: newOrigin.y === props.image.origin.y ? undefined : newOrigin.y
                    },
                    dimensions: {
                        x: width === props.image.dimensions.x ? undefined : width,
                        y: value
                    }
                });
            }
        });
        const rotation = computed({
            get: () => round(radToDeg(props.image.rotation), 1E-3),
            set: value => {
                store.mutations.setProps(props.slideId, props.image.id, GRAPHIC_TYPES.IMAGE, { rotation: degToRad(value) });
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
