<template>
<div id='editor'>
    <slide v-for='slide in $store.getters.slides' 
        :key='slide.id'
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
    private mounted(): void {
        // Scroll to the middle of the editor
        this.$el.scrollLeft = (this.$store.getters.rawEditorViewbox.width - this.$el.clientWidth) / 2;
        this.$el.scrollTop = (this.$store.getters.rawEditorViewbox.height - this.$el.clientHeight) / 2;
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
