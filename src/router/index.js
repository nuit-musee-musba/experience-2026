import {createRouter, createWebHistory} from "vue-router";
import Credits from "@/components/Credits.vue";
import Map from "@/components/Map.vue";
import ClickImg from "@/components/ClickImg.vue";
import Carousel from "@/components/Carousel.vue";
import IdleView from "@/components/IdleView.vue";
import Boutons from "@/components/BoutonsTest.vue";


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: ClickImg,
      props: { path: "basilique.jpg" },
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
      props: { path: "basilique.jpg" },
    },
    {
      path: "/carousel",
      component: Carousel,
      props: { images: ["/images/basilique.jpg", "/images/basilique2.jpg"] },
    },
    {
      path: "/idle",
      component: IdleView,
    },
    {
      path: "/boutons",
      component: Boutons,
    },
  ],
});

export default router;
