<template>
	<button @click="onClick">Click!</button>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class MyComponent extends Vue {
	public message: string = this.$store.state.message;

	public onClick(): void {
		window.alert(this.message);
	}
}
</script>