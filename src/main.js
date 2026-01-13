import {createApp} from 'vue'
import { createPinia } from "pinia"
import './styles/main.scss'
import App from './App.vue'
import router from "./router"

const pinia = createPinia();

createApp(App)
    .use(pinia)
    .use(router)
    .mount("#app")

