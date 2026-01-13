<script setup>
import {useRoute} from "vue-router";
import { allData } from '@/store.js';
import { computed } from 'vue';
const route = useRoute();

const museum = computed(() => {
  if (allData.value) {
    const laVille = allData.value.find( ville => ville.slug === route.params.citySlug );
    if (laVille) {
      const leMusee = laVille.museums.find( m => m.slug === route.params.museumSlug );
      return leMusee;
    }
  }
})

</script>
<template>
  <div v-if="museum" class="artwork-detail-box">
    <RouterLink @click.stop class="test" :to="`/${route.params.citySlug}/${museum.slug}/${artwork.slug}`" v-for="artwork in museum.artworks " :key="artwork.slug">
      {{ artwork.name }}
    </RouterLink>
  </div>
</template>

<style scoped lang="scss">
.artwork-detail-box {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: white;
}
</style>