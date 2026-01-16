<template>
  <nav class="nav">
    <div class="nav-buttons">
      <Button color="primary" icon-only icon-primary @click="router.push('/')">
        <template #icon-primary><IconMap /></template>
      </Button>

      <Button v-if="backTarget" color="secondary" icon-primary :text-content="backLabel" @click="router.push(backTarget)">
        <template #icon-primary><IconPin /></template>
      </Button>
    </div>

    <div class="nav-buttons" v-if="currentList.length > 1">
      <Button :color="contextColor" icon-primary :text-content="prevLabel" @click="navigate(-1)">
        <template #icon-primary><IconArrowLeft /></template>
      </Button>

      <Button :color="contextColor" icon-secondary :text-content="nextLabel" @click="navigate(1)">
        <template #icon-secondary><IconArrowRight /></template>
      </Button>
    </div>
    <Button class="galery-button" color="artwork" icon-only icon-primary @click="goGallery">
      <template #icon-primary><IconGallery /></template>
    </Button>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { allData } from '@/store.js';
import Button from '../buttons/Button.vue';
import IconMap from '../icons/IconMap.vue';
import IconPin from '../icons/IconPin.vue';
import IconArrowLeft from '../icons/IconArrowLeft.vue';
import IconArrowRight from '../icons/IconArrowRight.vue';
import IconGallery from '../icons/IconGallery.vue';

const route = useRoute();
const router = useRouter();

const isArtwork = computed(() => !!route.params.artworkSlug);
const isMuseum = computed(() => !!route.params.museumSlug && !isArtwork.value);

const currentCity = computed(() => allData.value?.find(v => v.slug === route.params.citySlug));
const currentMuseum = computed(() => currentCity.value?.museums.find(m => m.slug === route.params.museumSlug));

const currentList = computed(() => {
  if (isArtwork.value) return currentMuseum.value?.artworks || [];
  if (isMuseum.value) return currentCity.value?.museums || [];
  return [];
});

const contextColor = computed(() => isArtwork.value ? 'artwork' : 'place');
const prevLabel = computed(() => isArtwork.value ? 'Œuvre précédente' : 'Lieu précédent');
const nextLabel = computed(() => isArtwork.value ? 'Œuvre suivante' : 'Lieu suivant');

const backLabel = computed(() => isArtwork.value ? `Retour à ${currentMuseum.value?.name}` : `Retour à ${currentCity.value?.name}`);
const backTarget = computed(() => {
  if (isArtwork.value) return `/${route.params.citySlug}/${route.params.museumSlug}`;
  if (isMuseum.value) return `/${route.params.citySlug}`;
  return null;
});

const navigate = (direction) => {
  const slug = isArtwork.value ? route.params.artworkSlug : route.params.museumSlug;
  const index = currentList.value.findIndex(item => item.slug === slug);
  const nextIndex = (index + direction + currentList.value.length) % currentList.value.length;
  const target = currentList.value[nextIndex];

  const path = isArtwork.value
      ? `/${route.params.citySlug}/${route.params.museumSlug}/${target.slug}`
      : `/${route.params.citySlug}/${target.slug}`;

  router.push(path);
};

const goGallery = () => {
    router.push(`/all-artworks`);
};
</script>

<style lang="scss" scoped>
.nav {
  display: flex;
  padding: $spacing-32;
  border-top: $spacing-8 solid $black;
  background: white;
  z-index: 1000;
  width: 100%;
  position: fixed;
  bottom: 0;
}
.nav-buttons {
  display: flex;
  gap: $spacing-40;
  &:first-child { margin-right: auto; }
}

.galery-button {
  margin-left: 40px;
}
</style>