<template>
	<button @click="onClick">Click!</button>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class MyComponent extends Vue {
	public message: string = "Hello!";

	public onClick(): void {
		window.alert(this.message);
	}
}
</script>