<template>
  <main class="listing" role="main">
    <!-- Bouton fermer -->
    <button
      class="close-button"
      @click="goBack"
      aria-label="Fermer le listing et revenir à l'étape précédente"
    >
      ✕ Fermer
    </button>

    <!-- Titre du listing -->
    <h1 class="listing-title">{{ listingTitle }}</h1>

    <!-- Lieu -->
    <p class="listing-location">
      <span class="city">{{ city }}</span> — <span class="place">{{ placeName }}</span>
    </p>

    <!-- Liste des œuvres -->
    <ul class="artwork-list">
      <li
        v-for="artwork in artworks"
        :key="artwork.id"
        class="artwork-item"
      >
        <RouterLink
          :to="`/oeuvre/${artwork.id}`"
          class="artwork-link"
        >
          <img
            :src="artwork.image"
            :alt="`Image de l'œuvre ${artwork.title}`"
            loading="lazy"
            width="300"
            height="200"
          />
          <h2 class="artwork-title">{{ artwork.title }}</h2>
        </RouterLink>
      </li>
    </ul>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const listingTitle = 'Œuvres exposées'
const city = 'Bordeaux'
const placeName = 'Musée des Beaux-Arts'

const artworks = [
  {
    id: 1,
    title: 'Le Port de la Lune',
    image: '/images/port-lune.webp'
  },
  {
    id: 2,
    title: 'La Femme au miroir',
    image: '/images/femme-miroir.webp'
  },
  {
    id: 3,
    title: 'Nature morte aux fruits',
    image: '/images/nature-morte.webp'
  }
]

function goBack() {
  router.back()
}
</script>

<style scoped>
.listing {
  max-width: 1100px;
  margin: auto;
  padding: 1rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}

.listing-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.listing-location {
  color: #444;
  margin-bottom: 2rem;
}

.artwork-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.artwork-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.artwork-link:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 4px;
}

.artwork-item img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.artwork-title {
  margin-top: 0.5rem;
  font-size: 1.1rem;
}
</style>
