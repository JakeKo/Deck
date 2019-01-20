import Vue, { CreateElement } from "vue";
import App from "./App.vue";
import Store from "./store";

const appContainer: HTMLDivElement = document.createElement<"div">("div");
appContainer.setAttribute("id", "app-container");

const exportFrame: HTMLDivElement = document.createElement<"div">("div");
exportFrame.setAttribute("id", "export-frame");
exportFrame.style.display = "none";

const body: HTMLBodyElement = document.getElementsByTagName("body")[0];
body.appendChild<HTMLDivElement>(appContainer);
body.appendChild<HTMLDivElement>(exportFrame);

new Vue({
    el: "#app-container",
    store: Store,
    render: (h: CreateElement) => h(App)
});
