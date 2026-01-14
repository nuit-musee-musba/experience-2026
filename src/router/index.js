import {createRouter, createWebHistory, RouterView} from "vue-router";
import Credits from "@/components/Credits.vue";
import Map from "@/components/Map.vue";
import Infos from "@/components/Infos.vue";
import ClickImg from "@/components/ClickImg.vue";
import Carousel from "@/components/Carousel.vue";
import ArtworkDetails from "@/components/ArtworkDetails.vue";
import ArtworkList from "@/components/ArtworkList.vue";
import AllArtwork from "@/components/AllArtwork.vue";
import ViewAllArtworks from "@/components/ViewAllArtworks.vue";


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Map,
      props: { path: "basilique.jpg" },
      children: [
        {
          path: ":citySlug",
          name: "city-detail",
          component: RouterView,
          children: [
            {
              path: ":museumSlug",
              name: "museum-detail",
              component: Infos,
              children: [
                {
                  path: "list", // <--- ON MET LA LISTE EN PREMIER
                  name: "artworks-lists",
                  component: ArtworkList,
                },
                {
                  path: ":artworkSlug",
                  name: "artwork-detail",
                  component: ArtworkDetails,
                }
              ]
            }
          ]
        }
      ]
    },
    {
      path: "/credits",
      component: Credits,
    },
    {
      path: "/test1",
      component: ViewAllArtworks,
    },
    {
      path: "/all",
      component: AllArtwork,
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
    }
  ],
});

export default router;
