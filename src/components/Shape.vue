/* tslint:disable */
<template>
<div id="shape" :style="style"></div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class Shape extends Vue {
    @Prop({ type: String, default: "white" })
    public backgroundColor?: String;

    @Prop({ type: String, default: "100px" })
    public height?: String;

    @Prop({ type: String, default: "100px" })
    public width?: String;

    @Prop({ type: String, default: "solid 1px rgba(0, 0, 0, 0.15)" })
    public border?: String;

    get style() {
        return {
            backgroundColor: this.backgroundColor,
            height: this.height,
            width: this.width,
            border: this.border
        };
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>

</style>
