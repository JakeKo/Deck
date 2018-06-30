<template>
<div>
	<h1>Hello App!</h1>
	<p>
		<router-link to="/foo">Go to Foo</router-link>
		<router-link to="/bar">Go to Bar</router-link>
	</p>
	
	<router-view></router-view>
	<button @click="onClick">Click!</button>
</div>
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