import Vue from "vue";
import App from "./routes/App.vue";
import Store from "./Store";
import Router from "./Router";

new Vue({
	el: "#app",
	store: Store,
	router: Router,
	render: h => h(App)
});