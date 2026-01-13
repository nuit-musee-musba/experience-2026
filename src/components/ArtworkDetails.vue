<script setup>
import {useRoute, useRouter} from "vue-router";
import { allData } from '@/store.js';
import { computed } from 'vue';
const router = useRouter();
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

const museum = computed(() => {
  if (allData.value) {
    const laVille = allData.value.find( ville => ville.slug === route.params.citySlug );
    if (laVille) {
      const leMusee = laVille.museums.find( m => m.slug === route.params.museumSlug );
      return leMusee;
    }
  }
  return null;
})

const goToNext = () => {

  const isIndex = (element) => element.slug === route.params.artworkSlug;

  if(museum.value.artworks.length > 1) {
    const indexfinal = museum.value.artworks.findIndex(isIndex)
    let nextIndex = indexfinal + 1;

    if(museum.value.artworks[nextIndex]){
      router.push(`/${route.params.citySlug}/${route.params.museumSlug}/${museum.value.artworks[nextIndex].slug}`);

    } else {
      nextIndex = 0;
      router.push(`/${route.params.citySlug}/${route.params.museumSlug}/${museum.value.artworks[nextIndex].slug}`);
    }
  }
}

const goToPrev = () => {

  const isIndex = (element) => element.slug === route.params.artworkSlug;

  if(museum.value.artworks.length > 1) {
    const indexfinal = museum.value.artworks.findIndex(isIndex)
    let prevIndex = indexfinal - 1;

    if(museum.value.artworks[prevIndex]){
      router.push(`/${route.params.citySlug}/${route.params.museumSlug}/${museum.value.artworks[prevIndex].slug}`);

    } else {
      prevIndex = museum.value.artworks.length -1;
      router.push(`/${route.params.citySlug}/${route.params.museumSlug}/${museum.value.artworks[prevIndex].slug}`);
    }
  }
}


</script>
<template>
  <div @click.stop v-if="artwork" class="artwork-detail-box">
    <h2>{{ artwork.name }}</h2>

    <div v-if="museum.artworks.length > 1">
      <button @click="goToNext">test</button>
      <button @click="goToPrev">test</button>
    </div>
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