<template>   
<div :class="{ 'tool': true, 'active-tool': isActive }" @click="$emit('click')">
    <i :class="icon"></i>
    {{toolName}}
</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class Tool extends Vue {
    @Prop({ type: String, required: true }) private toolName!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Prop({ type: String, required: true }) private icon!: string;
}
</script>

<style lang="scss" scoped>
@import "../styles/application";

.active-tool {
    background: $color-information !important;
    color: $color-primary;
}
</style>
