<script setup>
import { useRoute } from "vue-router";
import { allData } from '@/store.js';
import { computed, ref, watch } from 'vue';
import { useElementVisibility } from '@vueuse/core';
import { useSplitText } from '../composables/useSplitText.js';
import BaseFrame from "@/components/layouts/BaseFrame.vue";
import SmartNavbar from "@/components/layouts/SmartNavbar.vue";

const route = useRoute();

// Trouver le continent actuel
const continent = computed(() => {
  if (!allData.value) return null;
  return allData.value.find(c =>
    c.Name.toLowerCase() === route.params.continentSlug
  );
});

// Trouver la ville dans le continent
const city = computed(() => {
  if (!continent.value) return null;
  return continent.value.cities.find(v => v.slug === route.params.citySlug);
});

// Trouver le musée dans la ville
const museum = computed(() => {
  if (!city.value) return null;
  return city.value.museums.find(m => m.slug === route.params.museumSlug);
});

// Animations
const titleAndLocationRef = ref(null);
const descriptionRef = ref(null);

const titleAndLocationVisible = useElementVisibility(titleAndLocationRef);
const descriptionVisible = useElementVisibility(descriptionRef);

const { split } = useSplitText(descriptionRef);

watch(() => museum.value, async () => {
  await nextTick();
  
  // Si déjà visible, on doit forcer la ré-animation
  if (titleAndLocationVisible.value) titleAndLocationRef.value?.classList.add('visible');
  if (descriptionVisible.value && descriptionRef.value) {
    split();
    requestAnimationFrame(() => {
      descriptionRef.value?.classList.add('visible');
    });
  }
});

watch(titleAndLocationVisible, (visible) => {
  if (visible && titleAndLocationRef.value) {
    titleAndLocationRef.value.classList.add('visible');
  }
});

watch(descriptionVisible, (visible) => {
  if (visible && descriptionRef.value) {
    // S'assurer que le split est fait avant d'ajouter la classe visible
    split();
    requestAnimationFrame(() => {
      descriptionRef.value?.classList.add('visible');
    });
  }
});
</script>

<template>
  <Transition name="fade" mode="out-in" appear>
    <BaseFrame v-if="museum">
      <div class="location-detail-box">
        <section class="content-section">
          <div class="location-container location-infos">
            <div
              class="title-and-location"
              ref="titleAndLocationRef"
              :key="museum.slug"
            >
              <p style="--anim-index: 0">{{ city?.name }}</p>
              <h2 class="title" style="--anim-index: 1">{{ museum.name }}</h2>
            </div>
          </div>
          <div class="scroll-content">
            <div class="location-main-image">
              <img v-if="museum.images?.length" :src="`/images/${encodeURI(museum.images[0].file)}`"
                :alt="museum.name" />
            </div>
            <div class="scroll-content-box">
              <p
                ref="descriptionRef"
                class="description"
                :key="museum.slug"
              >
                {{ museum.description }}
              </p>
              <h3 class="locations-artworks-section-title">Découvrez les œuvres de ce lieu</h3>
              <div class="location-artworks-listing">
                <RouterLink class="artworks-item" v-for="artwork in museum.artworks" :key="artwork.slug"
                  :to="`/${route.params.continentSlug}/${route.params.citySlug}/${museum.slug}/${artwork.slug}`">
                  <div class="artworks-item-image">
                    <img v-if="artwork.images?.length" :src="`/images/${encodeURI(artwork.images[0].file)}`"
                      :alt="artwork.name" />
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-out;

  .location-detail-box {
    transition: transform 0.5s ease-out;
  }
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;

  .location-detail-box {
    transform: translateX(-100%);
  }
}

.location-detail-box {
  position: fixed;
  left: 0;
  top: 0;
  z-index: -1;
  background: white;
  width: 50%;
  max-width: 1744px;
  height: 100%;
  border-right: 44px solid $green-300;
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

    .title {
      font-family: $font-family-headings;
      line-height: 100%;
    }
  }

  .scroll-content {
    height: 100%;
    overflow-y: scroll;
    padding-bottom: 200px;

    &::-webkit-scrollbar {
      width: $spacing-24;
    }

    &::-webkit-scrollbar-thumb {
      background-color: $black;
    }

  }

  .scroll-content-box {
    padding: $spacing-80 $spacing-96;
    display: flex;
    flex-direction: column;
    gap: $spacing-80;

    .description {
      :deep(.line) {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 1s calc(var(--line-index) * 0.05s) $ease-out-quint,
          transform 1s calc(var(--line-index) * 0.05s) $ease-out-quint;
        display: block;
      }

      &.visible {
        :deep(.line) {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }
  }
}

.title-and-location {
  display: flex;
  flex-direction: column;
  gap: $spacing-16;
  box-sizing: border-box;
  padding: $spacing-48 $spacing-96;
  min-height: 0;

  >* {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 1s calc(var(--anim-index) * 0.1s) $ease-out-quint,
      transform 1s calc(var(--anim-index) * 0.1s) $ease-out-quint;
  }

  &.visible {
    >* {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.location-main-image {
  width: 100%;
  height: 800px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

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

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}
</style>