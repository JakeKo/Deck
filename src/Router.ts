import Vue from "vue";
import VueRouter from "vue-router";

import App from "./routes/App.vue";

Vue.use(VueRouter);

export default new VueRouter({
	routes: [
		{
			path: "/foo",
			component: App
		},
		{
			path: "/bar",
			component: App
		}
	]
});