<template>
  <div class="layout layout-location">
    <div class="layout-border layout-border__top" role="presentation"></div>
    <div class="layout-border layout-border__bottom" role="presentation"></div>
    <div class="layout-border layout-border__left" role="presentation"></div>
    <div class="layout-border layout-border__right" role="presentation"></div>

    <main class="main">
      <slot></slot>
    </main>

    <nav v-if="!hideNav" class="nav nav-location">
      <div class="nav-buttons">

        <Button color="primary" icon-only icon-primary>
          <template #icon-primary>
            <IconMap />
          </template>
        </Button>

        <Button color="secondary" @click="goToCity('paris')" :text-content="`Retour à ${city.name}`" icon-primary>
          <template #icon-primary>
            <IconPin /> 
          </template>
        </Button>
      </div>

      <div class="nav-buttons">
        <Button color="place" text-content="Lieu précédent" icon-primary @click="goToPrev">
          <template #icon-primary>
            <IconArrowLeft />
          </template>
        </Button>

        <Button color="place" text-content="Lieu suivant" icon-secondary @click="goToNext">
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
import IconPin from '../icons/IconPin.vue';
import IconArrowLeft from '../icons/IconArrowLeft.vue';
import IconArrowRight from '../icons/IconArrowRight.vue';
import IconGallery from '../icons/IconGallery.vue';

import { useRoute, useRouter } from "vue-router";
import { allData } from '@/store.js';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();

defineProps({
  hideNav: { type: Boolean, default: false }
});

const city = computed(() => {
  if (!allData.value) return null;
  return allData.value.find(ville => ville.slug === route.params.citySlug);
});

const museum = computed(() => {
  if (!city.value) return null;
  return city.value.museums.find(m => m.slug === route.params.museumSlug);
});

const museums = computed(() => city.value ? city.value.museums : []);

const goToCity = (city) => {
  if (!city.value) return;
  router.push({
    name: "city-detail",
    path: city,
  });
}

const goToNext = () => {
  const list = museums.value;
  if (!list || list.length === 0) return;

  const currentIndex = list.findIndex(m => m.slug === route.params.museumSlug);
  if (currentIndex === -1) return;

  const nextIndex = (currentIndex + 1) % list.length;
  const nextMuseum = list[nextIndex];

  router.push(`/${city.value.slug}/${nextMuseum.slug}`);
}

const goToPrev = () => {
  const list = museums.value;
  if (!list || list.length === 0) return;

  const currentIndex = list.findIndex(m => m.slug === route.params.museumSlug);
  if (currentIndex === -1) return;

  const prevIndex = (currentIndex - 1 + list.length) % list.length;
  const prevMuseum = list[prevIndex];

  router.push(`/${city.value.slug}/${prevMuseum.slug}`);
}

const goToGlobalList = () => {
  if (!museum.value) return;
  router.push(`/${city.value.slug}/${museum.value.slug}/list`);
}
</script>

<style lang="scss" scoped>
.layout {
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: fit-content;
  display: flex;
  flex-direction: column;

  .layout-border {
    position: fixed;
    z-index: 10;

    &__top, &__bottom { width: 100%; height: $border-width; }
    &__left, &__right { width: $border-width; height: 100%; }

    &__top { top: 0; left: 0; }
    &__bottom { bottom: 0; left: 0; }
    &__left { top: 0; left: 0; }
    &__right { top: 0; right: 0; }
  }

  .main {
    flex-grow: 1;
    height: fit-content;
  }
}

.nav {
  display: flex;
  padding: $spacing-32;
  border-top: $spacing-8 solid $black;
  background: white;
  z-index: 3;
  width: 100%;
  position: fixed;
  bottom: 0;
}

.nav-buttons {
  display: flex;
  gap: $spacing-40;

  &:first-child {
    margin-right: auto;
  }
}
</style>
