<template>   
<div class="tool" :id="isActive ? 'active-tool' : ''" @click="$emit('click')">
    <i :class="icon"></i>
    {{toolName}}
</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class Tool extends Vue {
    @Prop({ type: String, required: true })
    public toolName!: string;

    @Prop({ type: Boolean, required: true })
    public isActive!: boolean;

    @Prop({ type: String, required: true })
    public icon!: string;
}
</script>

<style lang="scss" scoped>
@import "../styles/components";

#active-tool {
    background: $color-tertiary;
}
</style>
