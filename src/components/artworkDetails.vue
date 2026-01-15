<script setup>
import { useRoute } from "vue-router";
import { allData } from '@/store.js';
import { computed, ref, watch, nextTick } from 'vue';
import ArtworkVueFrame from "./layouts/ArtworkVueFrame.vue";

import Button from "./buttons/Button.vue";

import IconPin from "./icons/IconPin.vue";
import IconLeave from "./icons/IconLeave.vue";
import IconArrowLeft from "./icons/IconArrowLeft.vue";
import IconArrowRight from "./icons/IconArrowRight.vue";

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

const activeImageIndex = ref(0);

const scrollContent = ref(null);
const isScrollEnd = ref(false);

const handleScroll = () => {
  if (scrollContent.value) {
    const { scrollTop, scrollHeight, clientHeight } = scrollContent.value;
    isScrollEnd.value = scrollTop + clientHeight >= scrollHeight - 2;
  }
};

watch(() => artwork.value, async () => {
  activeImageIndex.value = 0;
  await nextTick();
  if (scrollContent.value) {
    scrollContent.value.scrollTop = 0;
    handleScroll();
  }
});

const currentImage = computed(() => {
  if (artwork.value?.images?.length) {
    return artwork.value.images[activeImageIndex.value];
  }
  return null;
});

const selectImage = (index) => {
  activeImageIndex.value = index;
};

const scrollPrev = () => {
  if (activeImageIndex.value > 0) {
    activeImageIndex.value--;
  } else {
    activeImageIndex.value = artwork.value.images.length - 1;
  }
};

const scrollNext = () => {
  if (activeImageIndex.value < artwork.value.images.length - 1) {
    activeImageIndex.value++;
  } else {
    activeImageIndex.value = 0;
  }
};

// Crops avec coordonnées définies
const cropsWithLocation = computed(() => {
  if (currentImage.value?.crops) {
    return currentImage.value.crops.filter(
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
          <img v-if="currentImage" :src="`/images/${encodeURI(currentImage.file)}`" :alt="artwork.name" />
          <div v-for="crop in cropsWithLocation" :key="crop.id" class="crop-hotspot" :style="{
            left: crop.artwork_location_x + '%',
            top: crop.artwork_location_y + '%'
          }" @click="openCropPopup(crop)" />
        </div>
        <div class="infos-containers">
          <span class="figcaption">{{ currentImage?.copyright }}</span>
          <span class="figcaption">{{ currentImage?.description }}</span>
        </div>

        <div class="thumbnails-container" v-if="artwork.images && artwork.images.length > 1">
          <Button class="nav-arrow" icon-only icon-primary @click="scrollPrev">
            <template #icon-primary>
              <IconArrowLeft />
            </template>
          </Button>

          <div class="thumbnails-list">
            <div class="thumbnails-track">
              <div v-for="(img, index) in artwork.images" :key="img.id" class="thumbnail"
                   :class="{ 'is-active': index === activeImageIndex }" @click="selectImage(index)">
                <div class="img-container">
                  <div class="thumbnail-overlay"></div>
                  <img :src="`/images/${encodeURI(img.file)}`" :alt="img.description || artwork.name" />
                </div>
              </div>
            </div>
          </div>

          <Button class="nav-arrow" icon-only icon-primary @click="scrollNext">
            <template #icon-primary>
              <IconArrowRight />
            </template>
          </Button>
        </div>
      </section>

      <div v-if="showPopup" class="crop-popup-overlay" @click.self="closePopup">
        <div class="crop-popup">
          <div class="crop-popup-image">
            <img :src="`/images/${encodeURI(activeCrop.file)}`" :alt="activeCrop.description" />
          </div>
          <div class="crop-popup-content">
            <p class="crop-popup-text">{{ activeCrop.description }}</p>
            <Button color="primary" class="bouton" icon-primary @click="closePopup" :text-content="'Fermer'">
              <template #icon-primary>
                <IconLeave />
              </template>
            </Button>
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
        <div class="artwork-container artwork-description-container" :class="{ 'is-scroll-end': isScrollEnd }">
          <div class="scroll-content" ref="scrollContent" @scroll="handleScroll">
            <div class="header">
              <p class="enumeration">
                <span>{{ artwork.name }}</span>
                <span>{{ artwork.year }}</span>
                <span>{{ artwork.technique }}</span>
                <span>{{ artwork.place }}</span>
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
    padding: calc($spacing-96 - $border-width) $spacing-136 calc($spacing-96 - $border-width) calc($spacing-96 - $border-width);
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

      .crop-hotspot {
        position: absolute;
        width: 500px;
        height: 500px;
        border-radius: 50%;
        background: transparent;
        border: 2.91px solid rgba(#fff, 0.5);
        cursor: pointer;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
        box-shadow: 0px 1.62px 49.9px 53.92px rgba(255, 255, 255, 0.25);

        animation: pulse-glow 3s infinite ease-in-out;

        &:active {
          border-color: $white;
          box-shadow: 0px 1.62px 55px 65px rgba(255, 255, 255, 0.4);
          transform: translate(-50%, -50%) scale(1.05);
          animation: none;
        }
      }

      @keyframes pulse-glow {
        0% {
          box-shadow: 0px 1.62px 49.9px 53.92px rgba(255, 255, 255, 0.25);
          transform: translate(-50%, -50%) scale(1);
        }

        50% {
          box-shadow: 0px 1.62px 49.9px 65px rgba(255, 255, 255, 0.35);
          transform: translate(-50%, -50%) scale(1.02);
        }

        100% {
          box-shadow: 0px 1.62px 49.9px 53.92px rgba(255, 255, 255, 0.25);
          transform: translate(-50%, -50%) scale(1);
        }
      }

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }

    .infos-containers {
      display: flex;
      justify-content: space-between;
      gap: $spacing-32;
    }
    
    .figcaption {
      font-size: $spacing-24;
      line-height: 1.3;
      margin-top: $spacing-10;
      text-align: right;
      font-weight: bold;
    }

    .thumbnails-container {
      margin-top: $spacing-24;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: $spacing-16;
      width: 100%;
      height: 194px;
      min-height: 194px;
      padding: 0 10%;

      .nav-arrow {
        background-color: $white !important;
        border: 1px solid $black !important;
        cursor: pointer;
        padding: $spacing-16 !important;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $black;
        transition: opacity 0.3s;
        position: relative;
        z-index: 10;

        &:hover {
          opacity: 0.6;
        }

        :deep(svg) {
          width: $spacing-40 !important;
          height: $spacing-40 !important;
        }
      }

      .thumbnails-list {
        overflow: hidden;
        height: 100%;
        margin: 0 $spacing-24;

        .thumbnails-track {
          display: flex;
          height: 100%;
          gap: $spacing-48;
          justify-content: center;

          .img-container {
            width: 100%;
            height: 100%;
            border: 14px solid $white;
          }
        }

        .thumbnail {
          flex: 0 0 100px;
          height: 100%;
          cursor: pointer;
          position: relative;
          border: 7px solid transparent;
          transition: all 0.3s;
          opacity: 0.5;
          aspect-ratio: 1;

          &.is-active {
            opacity: 1;
            border-color: $black;
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }

    .button-container {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      margin-top: $spacing-32;

      .button {
        flex-direction: row-reverse;
      }
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
      padding: $spacing-48 $spacing-96;
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
        font-style: italic;
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
      transition: opacity 0.3s ease;
    }

    &.is-scroll-end::before {
      opacity: 0;
    }

    .scroll-content {
      height: 100%;
      overflow-y: auto;
      padding: $spacing-80 $spacing-96;
      display: flex;
      flex-direction: column;
      gap: $spacing-40;

      .header {
        display: flex;
        flex-direction: column;
        gap: $spacing-24;
      }

      .enumeration{ 
        display: flex;
        flex-direction: column;
        gap: $spacing-16;
        font-size: $spacing-56;
        margin-bottom: $spacing-40;

        span {
          line-height: 1;
        }
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

  .crop-content-section {
    position: relative;

    .button {
      position: absolute;
      top: $spacing-32;
      right: $spacing-32;
    }

  }

  .crop-popup-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    .crop-popup {
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      gap: $spacing-80;

      .crop-popup-image {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        img {
          max-width: 100%;
          max-height: 70vh;
          object-fit: contain;
        }
      }

      .crop-popup-content {
        background-color: $white;
        position: relative;

        .crop-popup-text {
          padding: $spacing-80 $spacing-56;
          font-family: $font-family-sans-serif;
          @include text-body;
          line-height: 1.6;
          max-width: 1600px;
        }

        .bouton {
          position: absolute;
          right: calc(-1 * $spacing-56);
          bottom: calc(-1 * $spacing-56);
          height: fit-content;
        }
      }
    }
  }
}
</style>