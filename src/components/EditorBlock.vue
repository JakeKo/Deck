/* tslint:disable */
<template>
    <div id="editor-block" :style="blockStyle">{{content}}</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class EditorBlock extends Vue {
    @Prop({ type: String, required: true })
    private content?: string;

    @Prop({ type: Object, required: true })
    private blockStyle?: any;
}
/* tslint:disable */
</script>

<style lang="scss" scoped>

</style>
