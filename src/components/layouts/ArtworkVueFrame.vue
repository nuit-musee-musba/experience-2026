<template>
  <div class="layout">
    <div class="spacing-div" role="presentation"></div>
    <div class="layout-border layout-border__top" role="presentation"></div>
    <div class="layout-border layout-border__bottom" role="presentation"></div>
    <div class="layout-border layout-border__left" role="presentation"></div>
    <div class="layout-border layout-border__right" role="presentation"></div>
    <main class="main">
      <slot></slot>
    </main>
    <nav class="nav">
      <div class="nav-buttons">
        <Button color="secondary" icon-only icon-primary>
          <template #icon-primary>
            <IconMap />
          </template>
        </Button>

        <Button color="secondary" text-content="Retour aux lieux" icon-primary>
          <template #icon-primary>
            <IconPin />
          </template>
        </Button>
      </div>

      <div class="nav-buttons">


        <Button color="secondary" text-content="Oeuvre précédente" icon-primary @click="goToPrev">
          <template #icon-primary>
            <IconArrowLeft />
          </template>
        </Button>

        <Button color="secondary" text-content="Oeuvre suivante" icon-secondary @click="goToNext">
          <template #icon-secondary>
            <IconArrowRight />
          </template>
        </Button>

        <Button color="secondary" icon-only icon-primary @click="goToList">
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

const goToList = () => {
  router.push(`/${route.params.citySlug}/${route.params.museumSlug}/list`);
}
</script>

<style lang="scss" scoped>
$border-color: $black;

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
    background-color: $border-color;
    z-index: 10;

    &__top,
    &__bottom {
      width: 100%;
      height: 5px;
    }

    &__left,
    &__right {
      width: 5px;
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

  .spacing-div {
    position: relative;
    width: 100%;
    height: 56px;
    border: 5px solid $border-color;
    border-bottom: 8px solid $border-color;
    z-index: 9999;
  }

  .main {
    flex-grow: 1;
    overflow: hidden;
    height: 0;
  }

  .nav {
    display: flex;
    padding: 42px 144px;
    border: 5px solid $border-color;
    border-top: 8px solid $border-color;
  }

  .nav-buttons {
    display: flex;
    gap: 40px;

    &:first-child {
      margin-right: auto;
    }
  }
}
</style>