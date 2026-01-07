import {createRouter, createWebHistory} from "vue-router";
import HelloWorld from "@/components/HelloWorld.vue";
import Credits from "@/components/Credits.vue";
import Map from "@/components/Map.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: HelloWorld,
    },
    {
      path: "/credits",
      component: Credits,
    },
    {
      path: "/map",
      component: Map,
    },
  ],
});

export default router;
