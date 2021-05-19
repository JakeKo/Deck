<template>
    <div ref='root' :style='style.curveEditorForm'>
        <div :style='style.row'>
            <div :style='style.column'>
                <NumberField
                    :name='"rotation"'
                    :labelIcon='"fas fa-sync-alt"'
                    :value='rotation'
                    @deck-input='value => rotation = value'
                />
                <ColorField
                    :name='"fill-color"'
                    :labelText='"FILL"'
                    :value='fillColor'
                    @deck-input='value => fillColor = value'
                />
            </div>
            <div :style='style.column'>
                <NumberField
                    :name='"stroke-width"'
                    :labelIcon='"fas fa-grip-lines"'
                    :value='strokeWidth'
                    @deck-input='value => strokeWidth = value'
                />
                <ColorField
                    :name='"stroke-color"'
                    :labelText='"STROKE"'
                    :value='strokeColor'
                    @deck-input='value => strokeColor = value'
                />
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
import { computed, defineComponent, PropType, reactive } from 'vue';
import DeckComponent from '../generic/DeckComponent';
import { ColorField, NumberField } from '../Core/Forms';
import { degToRad, radToDeg, round } from '@/utilities/utilities';
import { CurveSerialized } from '@/types';
import { GRAPHIC_TYPES } from '@/rendering/types';

const CurveEditorForm = defineComponent({
    components: {
        NumberField,
        ColorField
    },
    props: {
        curve: { type: Object as PropType<CurveSerialized>, required: true },
        slideId: { type: String, required: true }
    },
    setup: props => {
        const { root, store, baseStyle } = DeckComponent();
        const style = reactive({
            curveEditorForm: computed(() => ({
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

        const rotation = computed({
            get: () => round(radToDeg(props.curve.rotation), 1E-3),
            set: value => {
                store.mutations.setProps(props.slideId, props.curve.id, GRAPHIC_TYPES.CURVE, { rotation: degToRad(value) });
            }
        });
        const strokeWidth = computed({
            get: () => round(props.curve.strokeWidth),
            set: value => {
                store.mutations.setProps(props.slideId, props.curve.id, GRAPHIC_TYPES.CURVE, { strokeWidth: value });
            }
        });
        const fillColor = computed({
            get: () => props.curve.fillColor,
            set: value => {
                store.mutations.setProps(props.slideId, props.curve.id, GRAPHIC_TYPES.CURVE, { fillColor: value });
            }
        });
        const strokeColor = computed({
            get: () => props.curve.strokeColor,
            set: value => {
                store.mutations.setProps(props.slideId, props.curve.id, GRAPHIC_TYPES.CURVE, { strokeColor: value });
            }
        });

        return {
            root,
            style,
            rotation,
            strokeWidth,
            strokeColor,
            fillColor
        };
    }
});

export default CurveEditorForm;
</script>
