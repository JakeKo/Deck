import Vue from "vue";
import App from "./routes/App.vue";
import Store from "./store";
import Router from "./router";

new Vue({
    el: "#body",
    store: Store,
    router: Router,
    render: (h) => h(App)
});
