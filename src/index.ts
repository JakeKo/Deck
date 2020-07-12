import Vue from 'vue';
import App from './App.vue';
import Store from './store/index';

const appContainer = document.createElement('div');
appContainer.id = 'app-container';

const exportFrame = document.createElement('div');
exportFrame.id = 'export-frame';
exportFrame.style.display = 'none';

document.body.appendChild(appContainer);
document.body.appendChild(exportFrame);

new Vue({
    el: '#app-container',
    store: Store,
    render: h => h(App)
});
