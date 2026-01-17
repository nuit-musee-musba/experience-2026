<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import BaseFrame from '@/components/layouts/BaseFrame.vue'
import Button from '@/components/buttons/Button.vue'
import IconClose from '@/components/icons/IconClose.vue'
import { allData } from '@/store.js'

const router = useRouter()
const route = useRoute()

const closeGallery = () => {
  router.back()
}

const allCities = computed(() => allData.value || [])

const city = computed(() => {
  if (!allData.value) return null
  return allData.value.find(v => v.slug === route.params.citySlug)
})

const museum = computed(() => {
  if (!city.value) return null
  return city.value.museums.find(m => m.slug === route.params.museumSlug)
})
</script>

<template>
  <BaseFrame>
    <div class="gallery-container">
      <header class="gallery-header">
        <h1>Explorez les grands décors de Jean Dupas</h1>
      </header>

      <Button
        class="close-button"
        text-content="Fermer"
        color="primary"
        icon-primary
        @click="closeGallery"
      >
        <template #icon-primary>
          <IconClose />
        </template>
      </Button>

      <div class="content-listing">
        <div v-for="cityItem in allCities" :key="cityItem.slug" class="artworks-grid">
          <h2 class="city-name">{{ cityItem.name }}</h2>

          <div class="artworks-list">
            <div v-for="museumItem in cityItem.museums" :key="museumItem.slug">
              <RouterLink
                v-for="artwork in museumItem.artworks"
                :key="artwork.slug"
                class="artwork-item"
                :to="`/${cityItem.slug}/${museumItem.slug}/${artwork.slug}`"
              >
                <div class="artworks-item-image">
                  <img
                    v-if="artwork.images?.length"
                    :src="`/images/${encodeURI(artwork.images[0].file)}`"
                    :alt="artwork.name"
                  />
                </div>

                <div class="artwork-item-infos">
                  <h2>{{ artwork.name }}</h2>

                  <div class="artworks-details">
                    <p>{{ cityItem.name }},</p>
                    <p>{{ museumItem.name }},</p>
                    <p>{{ artwork.year }}</p>
                  </div>
                </div>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseFrame>
</template>

<style lang="scss" scoped>
/* ===== CONTAINER SCROLL ===== */
.gallery-container {
  height: 100%;
  width: 100%;
  overflow-y: auto;
}

/* ===== SCROLLBAR VISIBLE ===== */

/* Chrome / Edge / Safari */
.gallery-container::-webkit-scrollbar {
  width: 16px;
}

.gallery-container::-webkit-scrollbar-track {
  background: #e0e0e0;
}

.gallery-container::-webkit-scrollbar-thumb {
  background-color: #000;
  border-radius: 8px;
  border: 4px solid #e0e0e0;
}

.gallery-container::-webkit-scrollbar-thumb:hover {
  background-color: #333;
}

/* Firefox */
.gallery-container {
  scrollbar-width: auto;
  scrollbar-color: #000 #e0e0e0;
}

/* ===== UI ===== */

.close-button {
  position: absolute;
  right: 46px;
  bottom: 46px;
}

.city-name {
  font-family: $font-family-sans-serif, sans-serif;
  font-size: 56px;
  font-weight: 500;
  margin-bottom: 72px;
}

.content-listing {
  padding: $spacing-96;
  display: flex;
  flex-direction: column;
  gap: $spacing-136;
}

.artworks-list {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-right: 100px;
  flex-wrap: wrap;
}

.artwork-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  text-decoration: none;
  gap: $spacing-80;
  margin-bottom: $spacing-80;

  .artwork-item-infos {
    h2 {
      font-size: 100px;
    }

    .artworks-details {
      display: flex;
      flex-direction: row;
      gap: 5px;
      font-size: 48px;
    }
  }
}

.artworks-item-image {
  width: 276px;
  height: 276px;
  background: gray;
  transition: opacity 0.2s ease-in-out;

  img {
    aspect-ratio: 1 / 1;
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: $spacing-48 $spacing-96;
  border-bottom: 8px solid $black;
  width: 100vw;

  @include title-h1;
}
</style>
