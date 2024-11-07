import './assets/style/main.css';
import icon from "./assets/logo/leabot.png";

import { createApp } from 'vue';
import App from './app.vue';
import router from './router';

const app = createApp(App);

document.getElementById("favicon").setAttribute("href", icon);
document.getElementById("ogImage").setAttribute("content", icon);
document.getElementById("twitterImage").setAttribute("content", icon);

app.use(router);

app.mount('#app');