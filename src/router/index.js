import {createRouter, createWebHistory} from "vue-router";
import Credits from "@/components/Credits.vue";
import Map from "@/components/Map.vue";
import Infos from "@/components/infos.vue";
import ClickImg from "@/components/ClickImg.vue";
import Carousel from "@/components/Carousel.vue";
import ArtworkDetails from "@/components/ArtworkDetails.vue";
import ArtworkList from "@/components/ArtworkList.vue";


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Map,
      props: { path: "basilique.jpg" },
    },
    {
      path: "/credits",
      component: Credits,
    },
    {
      path: "/map",
      component: Map,
      children: [
        {
          path: "",
          name: "world-map",
          component: null,
        },
        {
          path: ":citySlug",
          name: "city-detail",
          component: null,
          children: [
            {
              path: ":museumSlug",
              name: "museum-detail",
              component: Infos,
              children: [
                {
                  path: ":artworkSlug",
                  name: "artwork-detail",
                  component: ArtworkDetails,
                },
                {
                  path: "list",
                  name: "artworks-lists",
                  component: ArtworkList,
                },
              ],
            },
          ],
        },
      ],
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
  ],
});

export default router;
