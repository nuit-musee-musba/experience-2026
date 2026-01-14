<script setup>
import { useRoute } from "vue-router";
import { allData } from '@/store.js';
import { computed } from 'vue';
import ArtworkVueFrame from "./layouts/ArtworkVueFrame.vue";


import Button from "./buttons/Button.vue";

import IconFullscreen from '@/components/icons/IconFullscreen.vue';
import IconPin from "./icons/IconPin.vue";
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


</script>
<template>
  <ArtworkVueFrame>
    <div v-if="artwork" class="artwork-detail-box">
      <section class="image-section">
        <div class="image-container">
          <img :src="artwork.image" :alt="artwork.name" />
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
      background-color: $gray-200;

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