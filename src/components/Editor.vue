<template>
<div id='editor' ref='editor'>
    <slide v-for='slide in $store.getters.slides' 
        :key='slide.id'
        :id='slide.id'
        :isActive='slide.id === $store.getters.activeSlide.id'
    />
</div>
</template>

<script lang='ts'>
import { Vue, Component, Watch } from 'vue-property-decorator';
import Slide from './Slide.vue';

@Component({
    components: {
        Slide
    }
})
export default class Editor extends Vue {
    @Watch('$store.getters.editorZoomLevel')
    private onZoomLevelUpdate(): void {
        (this.$refs['editor'] as HTMLDivElement).style.zoom = this.$store.getters.editorZoomLevel.toString();
    }

    private mounted(): void {
        const editorWidth = (this.$el as HTMLElement).offsetWidth;
        const editorHeight = (this.$el as HTMLElement).offsetHeight;
        const slideWidth = this.$store.getters.croppedEditorViewbox.width + 100;
        const slideHeight = this.$store.getters.croppedEditorViewbox.height + 100;

        const scale = Math.min(editorWidth / slideWidth, editorHeight / slideHeight);
        (this.$refs['editor'] as HTMLDivElement).style.zoom = scale.toString();
        this.$store.commit('editorZoomLevel', scale);
    }
}
</script>

<style lang='scss' scoped>
@import '../styles/colors';

#editor {
    display: flex;
    flex-grow: 1;
    overflow: scroll;
    background: $color-tertiary;
}
</style>
