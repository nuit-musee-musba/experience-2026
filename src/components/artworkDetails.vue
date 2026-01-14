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
        <div class="button-container">
          <Button color="tertiary" text-content="Plein écran" icon-primary>
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
          <p class="enumeration">{{ artwork.name }}, {{ artwork.year }}, {{ artwork.technique }}, {{ artwork.place }}
          </p>
          <div class="artwork-place">
            <IconPin class="pin" />
            <span>{{ artwork.place }}</span>
          </div>
        </div>
        <div class="artwork-container artwork-description-container">
          <div class="scroll-content">
            <h3 class="documentation">Documentation</h3>
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
    padding: 24px;
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
        width: 52px;
        height: 100%;
        background-color: $blue-100;
      }
    
      &::after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        right: -5px; // -52 - 5 (border)
        width: 5px;
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
      margin: 82px 248px;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }

    .button-container {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      padding-right: 52px; // compenser le bandeau bleu
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
      padding: 32px;
      min-height: 0;
    }

    .artwork-infos {
      flex: 0 0 40%;
      border-bottom: 5px solid $black;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 29px; // 24 + 5 for border
      }

      &::-webkit-scrollbar-thumb {
        background-color: $black;
      }

      display: flex;
      flex-direction: column;
      gap: 48px;

      .title {
        font-family: $font-family-headings;
        line-height: 100%;
      }

      .artwork-place {
        display: flex;
        align-items: center;
        gap: 4px;
      

      :deep(svg) {
        width: 56px;
        height: 56px;
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
      left: 5px;
      width: calc(100% - 34px); // 5px margins left - 29px scrollbar
      height: 30%;
      background: linear-gradient(to top, $white 10%, transparent);
      z-index: 1;
      pointer-events: none;
    }

    .scroll-content {
      height: 100%;
      overflow-y: auto;
      padding: 32px;

      &::-webkit-scrollbar {
        width: 29px; // 24 + 5 for border
      }

      &::-webkit-scrollbar-thumb {
        background-color: $black;
      }
    }
  }

  .documentation {
    font-weight: 500;
    font-size: 56px;
    margin-bottom: 16px;
  }
}
}
</style>