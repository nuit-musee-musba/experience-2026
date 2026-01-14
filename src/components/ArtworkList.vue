<script setup>
import { useRoute, useRouter } from "vue-router";
import { allData } from '@/store.js';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import Button from "./buttons/Button.vue";
import IconClose from "./icons/IconClose.vue";

const route = useRoute();
const router = useRouter();

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

const goBack = () => {
  router.push(`/${route.params.citySlug}`);
}

const thumbHeight = ref(0);
const thumbTop = ref(0);
const scrollContainer = ref(null);

const updateScrollbar = () => {
  if (scrollContainer.value) {
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
    // Si tout le contenu est visible, on cache la barre (height 0)
    if (scrollHeight <= clientHeight) {
      thumbHeight.value = 0;
      thumbTop.value = 0;
      return;
    }
    thumbHeight.value = (clientHeight / scrollHeight) * 100;
    thumbTop.value = (scrollTop / scrollHeight) * 100;
  }
}

let resizeObserver = null;

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', updateScrollbar);
    
    // Observer les changements de taille du contenu et du conteneur
    resizeObserver = new ResizeObserver(updateScrollbar);
    resizeObserver.observe(scrollContainer.value);
    // On observe aussi le premier enfant (la grille) pour détecter les changements de hauteur du contenu
    const grid = scrollContainer.value.querySelector('.artwork-grid');
    if (grid) {
      resizeObserver.observe(grid);
    }
    
    updateScrollbar();
  }
})

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', updateScrollbar);
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
})
</script>

<template>
  <div v-if="museum" class="artwork-list-page">
    <header class="header">
      <h1 class="title">Explorez les grands décors de Jean Dupas</h1>
    </header>

    <div class="scroll-wrapper">
      <div class="content-container" ref="scrollContainer">
        <div class="artwork-grid">
          <RouterLink 
            v-for="artwork in museum.artworks" 
            :key="artwork.slug"
            :to="`/${route.params.citySlug}/${museum.slug}/${artwork.slug}`"
            class="artwork-item"
          >
            <div class="artwork-image">
               <img v-if="artwork.images && artwork.images.length > 0" :src="`/images/${artwork.images[0].file}`" :alt="artwork.name">
            </div>
            <div class="artwork-info">
              <h2 class="artwork-name">{{ artwork.name }}</h2>
              <p class="artwork-details">{{ artwork.place }}, {{ artwork.year }}</p>
            </div>
          </RouterLink>
        </div>
      </div>

      <div class="scrollbar-container">
        <div class="scrollbar-track" :class="{ 'is-hidden': thumbHeight === 0 }">
          <div 
            class="scrollbar-thumb" 
            :style="{ 
              height: `${thumbHeight}%`,
              top: `${thumbTop}%`
            }"
          ></div>
        </div>
      </div>
    </div>

    <div class="footer">
      <Button color="secondary" text-content="Fermer" icon-primary @click="goBack">
        <template #icon-primary>
          <IconClose />
        </template>
      </Button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.artwork-list-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: $white;
  display: flex;
  flex-direction: column;
  padding: $grid-margin;
  box-sizing: border-box;
  z-index: 1000;
}

.header {
  margin-bottom: 120px;
  .title {
    @include title-h1;
    font-size: 110px;
    margin-top: 0;
  }
}

.scroll-wrapper {
  flex-grow: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.content-container {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 200px;
  
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.artwork-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: $grid-gutter;
  row-gap: 120px;
  padding-bottom: 100px;
}

.artwork-item {
  display: flex;
  text-decoration: none;
  color: $black;
  align-items: center;

  .artwork-image {
    width: 450px;
    height: 450px;
    flex-shrink: 0;
    margin-right: 60px;
    background-color: $gray-100;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .artwork-info {
    .artwork-name {
      @include title-h2;
      font-size: 80px;
      margin-bottom: 16px;
      line-height: 1.1;
      text-decoration: none;
    }
    
    .artwork-details {
      @include text-body;
      font-size: 36px;
      color: $black;
      margin: 0;
    }
  }
}

.scrollbar-container {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 100px;
  width: 16px;
  
  .scrollbar-track {
    width: 100%;
    height: 100%;
    border: 1px solid $black;
    position: relative;
    box-sizing: border-box;
    // On cache le trait de la track si le thumb est absent (pas de scroll)
    transition: opacity 0.3s ease;
    &.is-hidden {
      opacity: 0;
    }
  }

  .scrollbar-thumb {
    width: 100%;
    background-color: $black;
    position: absolute;
    left: 0;
    transition: height 0.1s ease, top 0.1s linear;
    min-height: 40px;
  }
}

.footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 40px;
  
  :deep(.btn) {
      padding: 24px 48px;
      font-size: 40px;
      
      .btn__icon svg {
          width: 40px;
          height: 40px;
      }
  }
}
</style>