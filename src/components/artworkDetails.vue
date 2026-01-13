<script setup>
import {useRoute} from "vue-router";
import { allData } from '@/store.js';
import { computed } from 'vue';
const route = useRoute();

const artwork = computed(() => {
  if (allData.value) {
    const laVille = allData.value.find( ville => ville.slug === route.params.citySlug );
    if (laVille) {
      const leMusee = laVille.museums.find( m => m.slug === route.params.museumSlug );
      if (leMusee) {
        const leArtwork = leMusee.artworks.find( a => a.slug === route.params.artworkSlug );
        return leArtwork;
      }
    }
  }
  return null;
})


</script>
<template>
  <div v-if="artwork" class="artwork-detail-box">
    <h2>{{ artwork.name }}</h2>
    <p>{{ artwork.description }}</p>
    test
  </div>
</template>

<style scoped lang="scss">
.artwork-detail-box {
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: white;
}


</style>