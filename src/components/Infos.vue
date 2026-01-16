<script setup>
import { useRoute } from "vue-router";
import { allData } from '@/store.js';
import { computed } from 'vue';
import BaseFrame from "@/components/layouts/BaseFrame.vue";
import SmartNavbar from "@/components/layouts/SmartNavbar.vue";

const route = useRoute();

const city = computed(() => {
  if (!allData.value) return null;
  return allData.value.find(v => v.slug === route.params.citySlug);
});

const museum = computed(() => {
  if (!city.value) return null;
  return city.value.museums.find(m => m.slug === route.params.museumSlug);
});
</script>

<template>
  <Transition name="fade" mode="out-in" appear>
    <BaseFrame v-if="museum">
      <div class="location-detail-box">
        <section class="content-section">
          <div class="location-container location-infos">
            <div class="title-and-location">
              <p>{{ city?.name }}</p>
              <h2 class="title">{{ museum.name }}</h2>
            </div>
          </div>
            <div class="scroll-content">
              <div class="location-main-image">
                <img v-if="museum.images?.length" :src="`/images/${encodeURI(museum.images[0].file)}`" :alt="museum.name" />
              </div>
              <div class="scroll-content-box">
                <p>{{ museum.description }}</p>
                <h3 class="locations-artworks-section-title">Découvrez les œuvres de ce lieu</h3>
                <div class="location-artworks-listing">
                  <RouterLink
                      class="artworks-item"
                      v-for="artwork in museum.artworks"
                      :key="artwork.slug"
                      :to="`/${route.params.citySlug}/${museum.slug}/${artwork.slug}`"
                  >
                    <div class="artworks-item-image">
                      <img v-if="artwork.images?.length" :src="`/images/${encodeURI(artwork.images[0].file)}`" :alt="artwork.name" />
                    </div>
                    <p>{{ artwork.name }}</p>
                  </RouterLink>
                </div>
              </div>
            </div>
        </section>
      </div>
      <router-view />

      <template #nav>
        <SmartNavbar v-if="!route.params.artworkSlug" />
      </template>
    </BaseFrame>
  </Transition>
</template>

<style lang="scss" scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.4s ease-out; }
.fade-enter-from { opacity: 0; transform: translateY(10px); }
.fade-leave-to { opacity: 0; transform: translateY(-10px); }

.location-detail-box {
  position: fixed;
  left: 0;
  top: 0;
  z-index: -1;
  background: white;
  width: 50%;
  max-width: 1744px;
  height: 100%;
  border-left: 44px solid $green-300;
  border-right: 8px solid $black;
}

.content-section {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  @include text-body;

  .location-infos {
    border-bottom: 8px solid $black;
    .title { font-family: $font-family-headings; line-height: 100%; }
  }

  .scroll-content {
    height: 100%;
    overflow-y: scroll;
    padding-bottom: 200px;
    &::-webkit-scrollbar { width: $spacing-24; }
    &::-webkit-scrollbar-thumb { background-color: $black; }

  }

  .scroll-content-box {
    padding: $spacing-80 $spacing-96;
    display: flex;
    flex-direction: column;
    gap: $spacing-80;
  }
}

.title-and-location {
  display: flex;
  flex-direction: column;
  gap: $spacing-16;
  box-sizing: border-box;
  padding: $spacing-48 $spacing-96;
  min-height: 0;
}

.location-main-image {
  width: 100%;
  height: 800px;
  overflow: hidden;
  img { width: 100%; height: 100%; object-fit: cover; }
  background: gray;
}

.locations-artworks-section-title {
  font-size: 56px;
}

.location-artworks-listing {
  display: flex;
  flex-wrap: wrap;
  gap: 44px;
  .artworks-item {
    text-decoration: none;
    color: inherit;
    width: 480px;
    gap: 35px;
    display: flex;
    flex-direction: column;
    .artworks-item-image {
      width: 480px;
      height: 418px;
      overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; }
    }
  }
}
</style>