import {createApp} from 'vue'
import { createPinia } from "pinia"
import './styles/main.scss'
import App from './App.vue'
import router from "./router"

const pinia = createPinia();

const app = createApp(App)
    .use(pinia)
    .use(router);

// Au rechargement, on ramène toujours à l'accueil pour éviter les
// animations d'entrée qui se déclenchent à mi-parcours.
router.isReady().then(() => {
    if (router.currentRoute.value.path !== "/") {
        router.replace("/");
    }
});

app.mount("#app");

