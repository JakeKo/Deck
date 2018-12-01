/* tslint:disable */
<template>   
<div id="tool">
    <div id="tool-icon" :style="toolIconStyle" @click="mount">
        <i :class="icon"></i>
    </div>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class Tool extends Vue {
    @Prop({ type: String, required: true })
    public toolName!: string;

    @Prop({ type: Boolean, required: false, default: false })
    public isActive!: boolean;

    @Prop({ type: String, required: true })
    public icon!: string;

    @Prop({ type: Function, required: true})
    public mount!: Function;

    get toolIconStyle(): any {
        return {
            border: `3px solid ${this.isActive ? this.$store.getters.theme.information : this.$store.getters.theme.tertiary}`,
            color: this.isActive ? this.$store.getters.theme.information : this.$store.getters.theme.tertiary
        };
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#tool {
    width: 100%;
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

#tool-icon {
    height: 36px;
    width: 36px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
