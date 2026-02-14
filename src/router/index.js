import {createRouter, createWebHistory, RouterView} from "vue-router";
import Map from "@/components/Map.vue";
import Infos from "@/components/Infos.vue";
import ClickImg from "@/components/ClickImg.vue";
import Carousel from "@/components/Carousel.vue";
import ArtworkDetails from "@/components/ArtworkDetails.vue";
import ArtworkList from "@/components/ArtworkList.vue";
import AllArtwork from "@/components/ViewAllArtworks.vue";
import ViewAllArtworks from "@/components/ViewAllArtworks.vue";
import Listing from "@/components/Listing.vue";
import Credit from "@/components/CreditsOverlay.vue";


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Map,
      props: { path: "basilique.jpg" },
      children: [
        // Route pour le continent seul (ex: /europe)
        {
          path: ":continentSlug",
          name: "continent-detail",
          component: RouterView,
          children: [
            // Route pour une ville dans un continent (ex: /europe/paris)
            {
              path: ":citySlug",
              name: "city-detail",
              component: RouterView,
              children: [
                // Route pour un musée dans une ville (ex: /europe/paris/tourdesvins)
                {
                  path: ":museumSlug",
                  name: "museum-detail",
                  component: Infos,
                  children: [
                    // Route pour une œuvre dans un musée (ex: /europe/paris/tourdesvins/lavigneetlevin)
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
        }
      ]
    },
    {
      path: "/test1",
      component: ViewAllArtworks,
    },
    {
      path: "/credits",
      component: Credit,
    },
    {
      path: "/all-artworks",
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
    },
  ],
});

export default router;