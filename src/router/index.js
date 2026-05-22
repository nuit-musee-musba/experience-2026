import { createRouter, createWebHistory, RouterView } from "vue-router";
import Map from "@/components/Map.vue";
import Infos from "@/components/Infos.vue";
import ArtworkDetails from "@/components/ArtworkDetails.vue";
import AllArtwork from "@/components/ViewAllArtworks.vue";
import Credit from "@/components/CreditsOverlay.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Map,
      props: { path: "basilique.webp" },
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
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
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
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;
