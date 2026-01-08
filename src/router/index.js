import {createRouter, createWebHistory} from "vue-router";
import HelloWorld from "@/components/HelloWorld.vue";
import Credits from "@/components/Credits.vue";
import Map from "@/components/Map.vue";
import ClickImg from "@/components/ClickImg.vue";

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
    {
      path: "/img",
      component: ClickImg,
      props: { path: "basilique.jpg" }
    },
  ],
});

export default router;
