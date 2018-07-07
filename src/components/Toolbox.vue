/* tslint:disable */
<template>
<div>
    <tools></tools>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import Vue from "vue";
import Component from "vue-class-component";
import Tools from "./Tools.vue";

@Component({
    components: {
        Tools
    }
})
export default class Toolbox extends Vue {}
/* tslint:disable */
</script>

<style lang="sass" scoped>

</style>
