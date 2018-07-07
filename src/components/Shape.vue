/* tslint:disable */
<template>
<div id="shape"></div>
</template>

<script lang="ts">
/* tslint:enable */
import Vue from "vue";
import Component from "vue-class-component";

const Props = Vue.extend({
    props: {
        backgroundColor: {
            type: String,
            required: false,
            default: "white"
        },
        height: {
            type: String,
            required: false,
            default: "100px"
        },
        width: {
            type: String,
            required: false,
            default: "100px"
        },
        border: {
            type: String,
            required: false,
            default: "solid 1px rgba(0, 0, 0, 0.15)"
        }
    }
});

@Component
export default class Shape extends Props {
    constructor() {
        super();
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>

</style>
