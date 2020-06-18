<template>
    <div class='roadmap-slide'>
        <div class='slide-topic'>Topic</div>
        <canvas class='slide-preview' />
    </div>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class RoadmapSlide extends Vue {

}
</script>

<style lang='scss' scoped>
.roadmap-slide {
    height: 100%;
    padding: 8px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    background: pink;
}

.slide-topic {
    font-size: 12px;
}

.slide-preview {
    height: 36px;
    width: 64px;
    background: grey;
}
</style>
