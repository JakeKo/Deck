<template>
<div id='roadmap'>
    <div id='slide-previews'>
        <div id='add-slide-button' @click='addSlide'></div>
    </div>
</div>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class Roadmap extends Vue {
    private addSlide(): void {
        this.$store.commit('addSlide', this.$store.getters.slides.length);
        this.$store.commit('activeSlide', this.$store.getters.slides[this.$store.getters.slides.length - 1].id);
    }
}
</script>

<style lang='scss' scoped>
@import '../styles/application';

#roadmap {
    position: relative;
    box-sizing: border-box;
    border-top: 1px solid $color-tertiary;
    height: 80px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

#slide-previews {
    height: calc(100% - 12px);
    min-width: 100%;
    overflow-x: auto;
    display: flex;
    align-items: center;
    padding: 0 8px;
    box-sizing: border-box;
}

#add-slide-button {
    height: 85%;
    width: 100px;
}

::-webkit-scrollbar {
    display: none;
}
</style>
