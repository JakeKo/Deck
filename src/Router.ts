import Vue from "vue";
import VueRouter from "vue-router";

import Index from "./routes/Index.vue";

Vue.use(VueRouter);

export default new VueRouter({
	routes: [
		{
			path: "/foo",
			component: Index
		},
		{
			path: "/bar",
			component: Index
		}
	]
});