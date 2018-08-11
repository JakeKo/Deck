/* tslint:disable */
<template>
<div id="shape" :style="style" @click="clickHandler">{{focused}}</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";
import StyleModel from "../models/StyleModel";

@Component
export default class Shape extends Vue {
    @Prop({ type: String, required: true })
    public id?: string;

    @Prop({ type: StyleModel, default: () => new StyleModel() })
    public styleModel?: StyleModel;

    @Prop({ type: Boolean, default: false })
    public focused?: boolean;

    private clickHandler() {
        this.$store.commit("setFocusedShape", this.id);
    }

    get style(): any {
        const style: any = { ...this.styleModel };
        style.border = this.focused ? "1px solid blue" : style.border || "";
        return new StyleModel(...style).toCss();
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#shape {
    cursor: pointer;
}

#focused-shape {
    border: 1px solid blue;
}
</style>
