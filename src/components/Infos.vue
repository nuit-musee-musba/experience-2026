
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

  <Transition name="fade" mode="out-in" appear>

    <div class="test" v-if="museum">

      <p  :key="museum.slug">{{ museum.name }}</p>

      <RouterLink @click.stop  v-if="museum.artworks.length < 2"  :to="`/${route.params.citySlug}/${museum.slug}/${artwork.slug}`" v-for="artwork in museum.artworks " :key="artwork.slug">
        {{ artwork.name }}
      </RouterLink>
      <RouterLink @click.stop v-if="museum.artworks.length > 1" class="test" :to="`/${route.params.citySlug}/${museum.slug}/list`">
        Voir toutes les oeuvres du lieu
      </RouterLink>
      <router-view />

    </div>

  </Transition>

</template>

<style lang="scss" scoped>

.fade-enter-active, .fade-leave-active {
  transition: all 0.4s ease-out;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.test {
  margin-top: 100px;
}

p, .test {
  position: fixed;
  left: 0;
  top: 0;
  background: white;
  width: 50%;
  height: 100%;
}

</style>