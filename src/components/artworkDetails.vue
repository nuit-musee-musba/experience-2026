<script setup>
import { useRoute } from "vue-router";
import { allData } from '@/store.js';
import { computed, ref } from 'vue';
import ArtworkVueFrame from "./layouts/ArtworkVueFrame.vue";


import Button from "./buttons/Button.vue";

import IconFullscreen from '@/components/icons/IconFullscreen.vue';
import IconPin from "./icons/IconPin.vue";
import IconClose from "./icons/IconClose.vue";
const route = useRoute();

const artwork = computed(() => {
  if (allData.value) {
    const laVille = allData.value.find(ville => ville.slug === route.params.citySlug);
    if (laVille) {
      const leMusee = laVille.museums.find(m => m.slug === route.params.museumSlug);
      if (leMusee) {
        const leArtwork = leMusee.artworks.find(a => a.slug === route.params.artworkSlug);
        return leArtwork;
      }
    }
  }
  return null;
})

// Crops avec coordonnées définies
const cropsWithLocation = computed(() => {
  if (artwork.value?.images?.[0]?.crops) {
    return artwork.value.images[0].crops.filter(
      crop => crop.artwork_location_x !== null && crop.artwork_location_y !== null
    );
  }
  return [];
});

// Gestion de la popup
const showPopup = ref(false);
const activeCrop = ref(null);

const openCropPopup = (crop) => {
  activeCrop.value = crop;
  showPopup.value = true;
};

const closePopup = () => {
  showPopup.value = false;
  activeCrop.value = null;
};

</script>
<template>
  <ArtworkVueFrame>
    <div v-if="artwork" class="artwork-detail-box">
      <section class="image-section">
        <div class="image-container">
          <img v-if="artwork.images && artwork.images.length > 0" :src="`/images/${encodeURI(artwork.images[0].file)}`" :alt="artwork.name" />
          <!-- Cercles cliquables pour les crops -->
          <div
            v-for="crop in cropsWithLocation"
            :key="crop.id"
            class="crop-hotspot"
            :style="{
              left: crop.artwork_location_x + '%',
              top: crop.artwork_location_y + '%'
            }"
            @click="openCropPopup(crop)"
          />
        </div>
        <figcaption class="figcaption">© ADAGP, Paris, 2026, photo : F. Deval, mairie de Bordeaux</figcaption>
        <div class="button-container">
          <Button color="secondary" text-content="Plein écran" icon-primary>
            <template #icon-primary>
              <IconFullscreen />
            </template>
          </Button>
        </div>

      </section>

      <!-- Popup pour afficher le crop zoomé -->
      <div v-if="showPopup" class="crop-popup-overlay" @click.self="closePopup">
        <div class="crop-popup">
          <div class="crop-popup-image">
            <img :src="`/images/${encodeURI(activeCrop.file)}`" :alt="activeCrop.description" />
          </div>
          <div class="crop-popup-content">
            <p class="crop-popup-text">{{ activeCrop.description }}</p>
            <button class="crop-popup-close" @click="closePopup">
              Fermer
              <IconClose />
            </button>
          </div>
        </div>
      </div>
      <section class="content-section">
        <div class="artwork-container artwork-infos">
          <div class="title-and-name">
            <h2 class="title">{{ artwork.name }}</h2>
            <p>Jean Dupas</p>
          </div>
        </div>
        <div class="artwork-container artwork-description-container">
          <div class="scroll-content">
            <div class="header">
              <p class="enumeration"><span>{{ artwork.name }}</span>, {{ artwork.year }}, {{ artwork.technique }}, {{
                artwork.place }}
              </p>
              <div class="artwork-place">
                <IconPin class="pin" />
                <span>{{ artwork.place }}</span>
              </div>
            </div>
            <p>{{ artwork.description }}</p>
          </div>
        </div>
      </section>
    </div>
  </ArtworkVueFrame>
</template>

<style scoped lang="scss">
.artwork-detail-box {
  height: 100%;
  width: 100%;
  display: flex;

  @include text-body;

  .image-section {
    width: 75%;
    height: 100%;
    padding: calc($spacing-96 - $border-width) $spacing-136 $spacing-32 calc($spacing-96 - $border-width);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;

    &::before {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      right: 0px; // -52 - 5 (border)
      width: calc($spacing-56 - $border-width); // 52px border - 5px border
      height: 100%;
      background-color: $blue-300;
    }

    &::after {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      right: -$border-width; // -52 - 5 (border)
      width: $border-width;
      height: 100%;
      background-color: $black;
    }

    .image-container {
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      position: relative;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }

    .figcaption {
      font-size: $spacing-24;
      line-height: 1.3;
      margin-top: $spacing-10;
      text-align: right;
    }

    .button-container {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      margin-top: $spacing-74;
    }
  }

  .content-section {
    width: 25%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;

    .artwork-container {
      box-sizing: border-box;
      padding: $spacing-80 $spacing-96;
      min-height: 0;

      .title-and-name {
        display: flex;
        flex-direction: column;
        gap: $spacing-16;
      }
    }

    .artwork-infos {
      border-bottom: $border-width solid $black;

      &::-webkit-scrollbar {
        width: $spacing-24;
      }

      &::-webkit-scrollbar-thumb {
        background-color: $black;
      }

      display: flex;
      flex-direction: column;
      gap: $spacing-48;

      .title {
        font-family: $font-family-headings;
        line-height: 100%;
      }
    }


  }

  .artwork-description-container {
    flex: 1;
    overflow: hidden;
    min-height: 0;
    position: relative;
    padding: 0 !important;

    &::before {
      content: '';
      display: block;
      position: absolute;
      bottom: 0;
      left: $border-width;
      width: calc(100% - (#{$spacing-24} + #{$spacing-10})); // 5px margins left - 29px scrollbar
      height: 30%;
      background: linear-gradient(to top, $white 10%, transparent);
      z-index: 1;
      pointer-events: none;
      display: none;
    }

    .scroll-content {
      height: 100%;
      overflow-y: auto;
      padding: $spacing-80 $spacing-96;
      display: flex;
      flex-direction: column;
      gap: $spacing-96;

      .header {
        display: flex;
        flex-direction: column;
        gap: $spacing-24;
      }

      &::-webkit-scrollbar {
        width: $spacing-24;
      }

      &::-webkit-scrollbar-thumb {
        background-color: $black;
      }

      .artwork-place {
        display: flex;
        align-items: center;
        gap: $spacing-4;


        :deep(svg) {
          width: $spacing-56;
          height: $spacing-56;
        }
      }
    }

    .documentation {
      font-weight: 500;
      font-size: $spacing-56;
      margin-bottom: $spacing-16;
    }
  }
}
</style>