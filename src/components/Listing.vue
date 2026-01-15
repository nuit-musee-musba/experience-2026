<template>
  <main class="listing" role="main">
    <div class="content-wrapper">
      <!-- Titre du listing -->
      <h1 class="listing-title">{{ listingTitle }}</h1>

      <div class="list-container">
        <!-- Liste des œuvres -->
        <div class="artwork-list">
          <section
            v-for="city in groupedArtworks"
            :key="city.name"
            class="city-section"
          >
            <h2 class="city-title">{{ city.name }}</h2>
            <ul class="city-grid">
              <li
                v-for="artwork in city.artworks"
                :key="artwork.id"
                class="artwork-item"
              >
                <RouterLink
                  :to="`/${artwork.citySlug}/${artwork.museumSlug}/${artwork.slug}`"
                  class="artwork-link"
                >
                  <div class="image-wrapper">
                    <img
                      v-if="artwork.images && artwork.images.length > 0"
                      :src="`/images/${encodeURI(artwork.images[0].file)}`"
                      :alt="`Image de l'œuvre ${artwork.name}`"
                      loading="lazy"
                    />
                  </div>
                  <div class="artwork-info">
                    <h2 class="artwork-title">{{ artwork.name }}</h2>
                    <p class="artwork-subtitle">
                      {{ artwork.place }}, {{ artwork.year }}
                    </p>
                  </div>
                </RouterLink>
              </li>
            </ul>
          </section>
        </div>

        <!-- Barre de défilement personnalisée -->
        <div class="custom-scrollbar">
          <div class="scrollbar-thumb"></div>
        </div>
      </div>
    </div>

    <!-- Bouton fermer -->
    <button
      class="close-button"
      @click="goBack"
      aria-label="Fermer le listing et revenir à l'étape précédente"
    >
      <IconClose class="close-icon" />
      <span>Fermer</span>
    </button>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { allData } from '@/store.js'
import { computed, onMounted } from 'vue'
import IconClose from '@/components/icons/IconClose.vue'

const router = useRouter()

const listingTitle = 'Explorez les grands décors de Jean Dupas'

const groupedArtworks = computed(() => {
  if (!allData.value) return []
  return allData.value.map(city => {
    const cityArtworks = []
    city.museums.forEach(museum => {
      museum.artworks.forEach(artwork => {
        cityArtworks.push({
          ...artwork,
          citySlug: city.slug,
          museumSlug: museum.slug,
          cityName: city.name,
          museumName: museum.name
        })
      })
    })
    return {
      name: city.name,
      artworks: cityArtworks
    }
  }).filter(city => city.artworks.length > 0)
})

onMounted(async () => {
  if (!allData.value) {
    try {
      //const response = await fetch("/content/content.json")
      const response = await fetch("https://useful-car-6cfb564836.strapiapp.com/api/villes?populate[museums][populate][artworks][populate][images][populate][crops][fields]=*")
      const allPins = await response.json()
      allData.value = allPins.data
    } catch (e) {
      console.error("Failed to fetch artworks", e)
    }
  }
})

function goBack() {
  router.back()
}
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.listing {
  position: fixed;
  inset: 0;
  background: white;
  z-index: 1000;
  padding: 60px 80px;
  display: flex;
  flex-direction: column;
  font-family: $font-family-sans-serif;
}

.content-wrapper {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.listing-title {
  font-size: 64px;
  font-weight: 300;
  margin-bottom: 60px;
  padding-bottom: 20px;
  color: #000;
  border-bottom: 2px solid #000;
}

.list-container {
  display: flex;
  gap: 40px;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.artwork-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
  padding-right: 40px;

  /* Hide default scrollbar */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.city-section {
  margin-bottom: 80px;
}

.city-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 40px;
  text-transform: capitalize;
}

.city-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px 40px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.artwork-item {
  // margin-bottom removed as handled by grid gap
}

.artwork-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 30px;
}

.image-wrapper {
  width: 180px;
  height: 180px;
  flex-shrink: 0;
  background: #f0f0f0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.artwork-info {
  flex: 1;
}

.artwork-title {
  font-size: 48px;
  font-weight: 300;
  margin: 0 0 5px 0;
  line-height: 1.1;
}

.artwork-subtitle {
  font-size: 24px;
  color: #000;
  margin: 0;
  opacity: 0.8;
}

.custom-scrollbar {
  width: 2px;
  background: #eee;
  position: relative;
  height: 80%;
  align-self: center;
}

.scrollbar-thumb {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: #000;
}

.close-button {
  position: absolute;
  bottom: 40px;
  right: 40px;
  background: #000;
  color: #fff;
  border: none;
  padding: 16px 32px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 18px;
  text-transform: capitalize;

  .close-icon {
    width: 20px;
    height: 20px;
  }
}

.artwork-link:focus-visible {
  outline: 2px solid #000;
  outline-offset: 4px;
}
</style>
