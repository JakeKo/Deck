import Vue, { CreateElement } from "vue";
import App from "./App.vue";
import Store from "./store";

new Vue({
    el: "#body",
    store: Store,
    render: (h: CreateElement) => h(App)
});
