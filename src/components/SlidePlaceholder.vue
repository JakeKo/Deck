<template>
    <div :style="containerStyle">
        <div :style="slideStyle">
            Click "Add Slide" to start your deck 😎😎
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { GETTERS, Viewbox } from '../store/types';
import { Getter } from 'vuex-class';
import { StyleCreator } from '../styling/types';
import DeckComponent from './generic/DeckComponent';

type StyleProps = {
    raw: Viewbox;
    cropped: Viewbox;
};
type Style = {
    container: any;
    slide: any;
};
const componentStyle: StyleCreator<StyleProps, Style> = ({ theme, base, props }) => ({
    container: {
        ...base.flexRowCC,
        minWidth: `${props.raw.width}px`,
        minHeight: `${props.raw.height}px`
    },
    slide: {
        ...base.flexRowCC,
        ...base.fontBody,
        border: `4px dashed ${theme.color.basecomp.flush}`,
        width: `${props.cropped.width}px`,
        height: `${props.cropped.height}px`
    }
});

@Component
export default class SlidePlaceholder extends DeckComponent<StyleProps, Style> {
    @Getter private [GETTERS.RAW_VIEWBOX]: Viewbox;
    @Getter private [GETTERS.CROPPED_VIEWBOX]: Viewbox;

    private get containerStyle(): any {
        return this[GETTERS.STYLE]({
            raw: this[GETTERS.RAW_VIEWBOX],
            cropped: this[GETTERS.CROPPED_VIEWBOX]
        }, componentStyle).container;
    }

    private get slideStyle(): any {
        return this[GETTERS.STYLE]({
            raw: this[GETTERS.RAW_VIEWBOX],
            cropped: this[GETTERS.CROPPED_VIEWBOX]
        }, componentStyle).slide;
    }
}
</script>
