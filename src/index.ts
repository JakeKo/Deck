import Vue from "vue";
import Index from "./routes/Index.vue";
import Store from "./Store";
import Router from "./Router";

new Vue({
	el: "#app",
	store: Store,
	router: Router,
	render: h => h(Index)
});