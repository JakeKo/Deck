/* tslint:disable */
<template>
<div>
    <toolbox></toolbox>

    <widgets></widgets>

    <workspace>
        <canvas>
            <slide></slide>
        </canvas>

        <roadmap>
            <slide-preview></slide-preview>
            <slide-preview></slide-preview>
            <slide-preview></slide-preview>
            <slide-preview></slide-preview>
            <slide-preview></slide-preview>
        </roadmap>
    </workspace>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class App extends Vue {
    
}
/* tslint:disable */
</script>

<style lang="sass" scoped>

</style>