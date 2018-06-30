import Vue from "vue";
import Component from "vue-class-component";

@Component({
	template: "<button @click=\"onClick\">Click!</button>"
})
export default class MyComponent extends Vue {
	// Initial data can be declared as instance properties
	public message: string = "Hello!";

	// Component methods can be declared as instance methods
	public onClick(): void {
		window.alert(this.message);
	}
}
