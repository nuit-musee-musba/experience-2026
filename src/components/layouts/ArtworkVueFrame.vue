<template>
  <div class="layout">
    <div class="layout-border layout-border__top" role="presentation"></div>
    <div class="layout-border layout-border__bottom" role="presentation"></div>
    <div class="layout-border layout-border__left" role="presentation"></div>
    <div class="layout-border layout-border__right" role="presentation"></div>
    <main class="main">
      <slot></slot>
    </main>
    <nav class="nav">
      <div class="nav-buttons">
        <Button color="primary" icon-only icon-primary>
          <template #icon-primary>
            <IconMap />
          </template>
        </Button>

        <Button color="primary" text-content="Retour aux lieux" icon-primary>
          <template #icon-primary>
            <IconPin />
          </template>
        </Button>
      </div>

      <div class="nav-buttons">


        <Button color="artwork" text-content="Œuvre précédente" icon-primary @click="goToPrev">
          <template #icon-primary>
            <IconArrowLeft />
          </template>
        </Button>

        <Button color="artwork" text-content="Œuvre suivante" icon-secondary @click="goToNext">
          <template #icon-secondary>
            <IconArrowRight />
          </template>
        </Button>

        <Button color="artwork" icon-only icon-primary @click="goToGlobalList">
          <template #icon-primary>
            <IconGallery />
          </template>
        </Button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import Button from '../buttons/Button.vue';
import IconMap from '../icons/IconMap.vue';
import IconArrowLeft from '../icons/IconArrowLeft.vue';
import IconArrowRight from '../icons/IconArrowRight.vue';
import IconGallery from '../icons/IconGallery.vue';

import { useRoute, useRouter } from "vue-router";
import { allData } from '@/store.js';
import { computed } from 'vue';

const router = useRouter();
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

const museum = computed(() => {
  if (allData.value) {
    const laVille = allData.value.find(ville => ville.slug === route.params.citySlug);
    if (laVille) {
      const leMusee = laVille.museums.find(m => m.slug === route.params.museumSlug);
      return leMusee;
    }
  }
  return null;
})

const goToNext = () => {

  const isIndex = (element) => element.slug === route.params.artworkSlug;

  if (museum.value.artworks.length > 1) {
    const indexfinal = museum.value.artworks.findIndex(isIndex)
    let nextIndex = indexfinal + 1;

    if (museum.value.artworks[nextIndex]) {
      router.push(`/${route.params.citySlug}/${route.params.museumSlug}/${museum.value.artworks[nextIndex].slug}`);

    } else {
      nextIndex = 0;
      router.push(`/${route.params.citySlug}/${route.params.museumSlug}/${museum.value.artworks[nextIndex].slug}`);
    }
  }
}

const goToPrev = () => {

  const isIndex = (element) => element.slug === route.params.artworkSlug;

  if (museum.value.artworks.length > 1) {
    const indexfinal = museum.value.artworks.findIndex(isIndex)
    let prevIndex = indexfinal - 1;

    if (museum.value.artworks[prevIndex]) {
      router.push(`/${route.params.citySlug}/${route.params.museumSlug}/${museum.value.artworks[prevIndex].slug}`);

    } else {
      prevIndex = museum.value.artworks.length - 1;
      router.push(`/${route.params.citySlug}/${route.params.museumSlug}/${museum.value.artworks[prevIndex].slug}`);
    }
  }
}

const goToGlobalList = () => {
  router.push(`/${route.params.citySlug}/${route.params.museumSlug}/list`);
}
</script>

<style lang="scss" scoped>

.layout {
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: $white;

  display: flex;
  flex-direction: column;

  .layout-border {
    position: fixed;
    background-color: $black;
    z-index: 10;

    &__top,
    &__bottom {
      width: 100%;
      height: $border-width;
    }

    &__left,
    &__right {
      width: $border-width;
      height: 100%;
    }

    &__top {
      top: 0;
      left: 0;
    }

    &__bottom {
      bottom: 0;
      left: 0;
    }

    &__left {
      top: 0;
      left: 0;
    }

    &__right {
      top: 0;
      right: 0;
    }
  }

  .main {
    flex-grow: 1;
    overflow: hidden;
    height: 0;
  }

  .nav {
    display: flex;
    padding: $spacing-32;
    border: $spacing-32;
    @include border-5;
    border-top: $spacing-8 solid $black;
  }

  .nav-buttons {
    display: flex;
    gap: $spacing-40;

    &:first-child {
      margin-right: auto;
    }
  }
}
</style>