<script setup>
import { useRoute } from "vue-router";
import { allData } from '@/store.js';
import { computed, ref, watch, nextTick } from 'vue';
import { useElementVisibility } from '@vueuse/core';
import { useSplitText } from '../composables/useSplitText.js';

// Layouts & Nav
import BaseFrame from "@/components/layouts/BaseFrame.vue";
import SmartNavbar from "@/components/layouts/SmartNavbar.vue";

// Components & Icons
import Button from "./buttons/Button.vue";
import IconPin from "./icons/IconPin.vue";
import IconLeave from "./icons/IconLeave.vue";
import IconArrowLeft from "./icons/IconArrowLeft.vue";
import IconArrowRight from "./icons/IconArrowRight.vue";

const route = useRoute();

// --- DATA ---
const artwork = computed(() => {
  if (!allData.value) return null;
  const laVille = allData.value.find(v => v.slug === route.params.citySlug);
  const leMusee = laVille?.museums.find(m => m.slug === route.params.museumSlug);
  return leMusee?.artworks.find(a => a.slug === route.params.artworkSlug);
});

const currentMuseum = computed(() => {
  if (!allData.value) return null;
  const laVille = allData.value.find(v => v.slug === route.params.citySlug);
  return laVille?.museums.find(m => m.slug === route.params.museumSlug);
});

// --- GESTION DES IMAGES ---
const activeImageIndex = ref(0);
const currentImage = computed(() => artwork.value?.images?.[activeImageIndex.value] || null);
const cropsWithLocation = computed(() => currentImage.value?.crops?.filter(c => c.artwork_location_x !== null) || []);

const selectImage = (index) => {
  activeImageIndex.value = index;
};

const scrollPrev = () => {
  const len = artwork.value?.images?.length || 0;
  if (len <= 1) return;
  activeImageIndex.value = (activeImageIndex.value - 1 + len) % len;
};

const scrollNext = () => {
  const len = artwork.value?.images?.length || 0;
  if (len <= 1) return;
  activeImageIndex.value = (activeImageIndex.value + 1) % len;
};

// --- SCROLL & POPUP ---
const scrollContent = ref(null);
const isScrollEnd = ref(false);
const showPopup = ref(false);
const activeCrop = ref(null);

const handleScroll = () => {
  if (scrollContent.value) {
    const { scrollTop, scrollHeight, clientHeight } = scrollContent.value;
    isScrollEnd.value = scrollTop + clientHeight >= scrollHeight - 2;
  }
};

const openCropPopup = (crop) => {
  activeCrop.value = crop;
  showPopup.value = true;
};

const closePopup = () => {
  showPopup.value = false;
  activeCrop.value = null;
};

watch(() => artwork.value, async () => {
  activeImageIndex.value = 0;
  await nextTick();
  if (scrollContent.value) {
    scrollContent.value.scrollTop = 0;
    handleScroll();
  }
});

// --- ANIMATIONS ---
const enumerationRef = ref(null);
const descriptionRef = ref(null);
const titleAndNameRef = ref(null);
const placeRef = ref(null);

const enumerationVisible = useElementVisibility(enumerationRef);
const descriptionVisible = useElementVisibility(descriptionRef);
const titleAndNameVisible = useElementVisibility(titleAndNameRef);
const placeVisible = useElementVisibility(placeRef);

useSplitText(descriptionRef);

watch(enumerationVisible, (v) => { if (v && enumerationRef.value) enumerationRef.value.classList.add('visible') }, { once: true });
watch(descriptionVisible, (v) => { if (v && descriptionRef.value) descriptionRef.value.classList.add('visible') }, { once: true });
watch(titleAndNameVisible, (v) => { if (v && titleAndNameRef.value) titleAndNameRef.value.classList.add('visible') }, { once: true });
watch(placeVisible, (v) => { if (v && placeRef.value) placeRef.value.classList.add('visible') }, { once: true });

</script>

<template>
  <BaseFrame v-if="artwork">
    <div class="artwork-detail-box">
      <section class="image-section">
        <div class="image-container">
          <img
              v-for="(img, index) in artwork.images"
              :key="img.id"
              :src="`/images/${encodeURI(img.file)}`"
              class="artwork-image"
              :class="{ 'visible': index === activeImageIndex }"
          />

          <div
              v-for="crop in cropsWithLocation"
              :key="crop.id"
              class="crop-hotspot"
              :style="{ left: crop.artwork_location_x + '%', top: crop.artwork_location_y + '%' }"
              @click="openCropPopup(crop)"
          ></div>
        </div>

        <div class="infos-containers">
          <span class="figcaption">{{ currentImage?.copyright }}</span>
          <span class="figcaption">{{ currentImage?.description }}</span>
        </div>

        <div class="thumbnails-container" v-if="artwork.images?.length > 1">
          <Button class="nav-arrow" color="secondary" icon-only icon-primary @click="scrollPrev">
            <template #icon-primary><IconArrowLeft /></template>
          </Button>

          <div class="thumbnails-list">
            <div class="thumbnails-track">
              <div
                  v-for="(img, index) in artwork.images"
                  :key="img.id"
                  class="thumbnail"
                  :class="{ 'is-active': index === activeImageIndex }"
                  @click="selectImage(index)"
              >
                <div class="img-container">
                  <div class="thumbnail-overlay"></div>
                  <img :src="`/images/${encodeURI(img.file)}`" />
                </div>
              </div>
            </div>
          </div>

          <Button class="nav-arrow" color="secondary" icon-only icon-primary @click="scrollNext">
            <template #icon-primary><IconArrowRight /></template>
          </Button>
        </div>
      </section>

      <section class="content-section">
        <div class="artwork-container artwork-infos">
          <div class="title-and-name" ref="titleAndNameRef">
            <h2 class="title" style="--anim-index: 0">{{ artwork.name }}</h2>
            <p style="--anim-index: 1">Jean Dupas</p>
          </div>
        </div>

        <div class="artwork-container artwork-description-container" :class="{ 'is-scroll-end': isScrollEnd }">
          <div class="scroll-content" ref="scrollContent" @scroll="handleScroll">
            <div class="header">
              <p class="enumeration" ref="enumerationRef">
                <span style="--enum-index: 0">{{ artwork.name }}</span>
                <span style="--enum-index: 1">{{ artwork.year }}</span>
                <span style="--enum-index: 2">{{ artwork.technique }}</span>
                <span style="--enum-index: 3">{{ currentMuseum?.adress }}</span>
              </p>
              <div class="artwork-place" ref="placeRef">
                <IconPin class="pin" style="--anim-index: 0" />
                <span style="--anim-index: 1">{{ currentMuseum?.adress }}</span>
              </div>
            </div>
            <p ref="descriptionRef" class="description">{{ artwork.description }}</p>
          </div>
        </div>
      </section>
    </div>

    <div v-if="showPopup" class="crop-popup-overlay" @click.self="closePopup">
      <div class="crop-popup">
        <div class="crop-popup-image">
          <img :src="`/images/${encodeURI(activeCrop.file)}`" />
        </div>
        <div class="crop-popup-content">
          <p class="crop-popup-text">{{ activeCrop.description }}</p>
          <Button color="primary" class="bouton" icon-primary @click="closePopup" text-content="Fermer">
            <template #icon-primary><IconLeave /></template>
          </Button>
        </div>
      </div>
    </div>

    <template #nav>
      <SmartNavbar />
    </template>
  </BaseFrame>
</template>

<style scoped lang="scss">
.artwork-detail-box {
  // LE FIX EST ICI : On force le plein écran et on passe au-dessus
  position: fixed;
  inset: 0; // top: 0, right: 0, bottom: 0, left: 0
  width: 100vw;
  height: 100vh;
  z-index: 50; // Supérieur au panneau du musée (qui est souvent à 10)
  background-color: $white;
  display: flex;
  @include text-body;

  .image-section {
    width: 75%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; position: relative;
    padding: calc($spacing-96 - $border-width) $spacing-136 calc(232px - $border-width) calc($spacing-96 - $border-width);

    &::before { content: ''; position: absolute; top: 0; right: 0; width: 52px; height: 100%; background-color: $blue-300; }
    &::after { content: ''; position: absolute; top: 0; right: 0; width: 5px; height: 100%; background-color: $black; }
  }

  .image-container {
    flex-grow: 1; display: flex; justify-content: center; align-items: center; overflow: hidden; position: relative;
    .artwork-image {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      max-width: 100%; max-height: 100%; object-fit: contain;
      opacity: 0; transition: opacity 0.5s ease; pointer-events: none;
      &.visible { opacity: 1; pointer-events: auto; }
    }
    .crop-hotspot {
      position: absolute; width: 500px; height: 500px; border-radius: 50%;
      border: 2.91px solid rgba(#fff, 0.5); cursor: pointer; transform: translate(-50%, -50%);
      box-shadow: 0px 1.62px 49.9px 53.92px rgba(255, 255, 255, 0.25);
      animation: pulse-glow 3s infinite ease-in-out; z-index: 10;
    }
  }

  .thumbnails-container {
    margin-top: $spacing-24; display: flex; align-items: center; justify-content: center; gap: $spacing-16;
    width: 100%; height: 194px; padding: 0 10%;

    .nav-arrow {
      border: 1px solid black !important; width: 80px; height: 80px;
    }

    .thumbnails-list {
      overflow: hidden; height: 100%; margin: 0 $spacing-24;
      .thumbnails-track { display: flex; height: 100%; gap: $spacing-48; justify-content: center; }
      .thumbnail {
        flex: 0 0 100px; height: 100%; cursor: pointer; border: 7px solid transparent; transition: all 0.3s; opacity: 0.5;
        &.is-active { opacity: 1; border-color: $black; }
        .img-container { width: 100%; height: 100%; border: 14px solid $white; }
        img { width: 100%; height: 100%; object-fit: cover; }
      }
    }
  }

  .content-section {
    width: 25%; height: 100%; display: flex; flex-direction: column; overflow: hidden;
    .artwork-container { box-sizing: border-box; }
    .artwork-infos {
      border-bottom: $border-width solid $black;
      .title { font-family: $font-family-headings; font-style: italic; line-height: 100%; }
      .title-and-name {
        display: flex; flex-direction: column; gap: $spacing-16; padding: 107px 92px;
        >* {
          opacity: 0; transform: translateY(20px);
          transition: opacity 1s calc(var(--anim-index) * 0.1s) $ease-out-quint, transform 1s calc(var(--anim-index) * 0.1s) $ease-out-quint;
        }
        &.visible >* { opacity: 1; transform: translateY(0); }
      }
    }
  }

  .artwork-description-container {
    flex: 1; overflow: hidden; position: relative;
    &::before { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 30%; background: linear-gradient(to top, $white 10%, transparent); z-index: 1; pointer-events: none; }

    .scroll-content {
      height: 100%; overflow-y: auto; padding: $spacing-80 $spacing-96; display: flex; flex-direction: column; gap: $spacing-40;
      padding-bottom: 200px;
      &::-webkit-scrollbar { width: $spacing-24; }
      &::-webkit-scrollbar-thumb { background-color: $black; }

      .enumeration {
        display: flex; flex-direction: column; gap: $spacing-16; font-size: $spacing-56;
        span {
          opacity: 0; transform: translateY(20px);
          transition: opacity 1s calc(var(--enum-index) * 0.1s) $ease-out-quint, transform 1s calc(var(--enum-index) * 0.1s) $ease-out-quint;
        }
        &.visible span { opacity: 1; transform: translateY(0); }
      }

      .description {
        :deep(.line) {
          opacity: 0; transform: translateY(20px);
          transition: opacity 1s calc(var(--line-index) * 0.05s) $ease-out-quint, transform 1s calc(var(--line-index) * 0.05s) $ease-out-quint;
        }
        &.visible :deep(.line) { opacity: 1; transform: translateY(0); }
      }
    }
  }

  .crop-popup-overlay {
    position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.75); display: flex; align-items: center; justify-content: center; z-index: 1000;
    .crop-popup {
      max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column;
      .crop-popup-image img { max-width: 100%; max-height: 70vh; object-fit: contain; }
      .crop-popup-content {
        background-color: $white; position: relative; padding: $spacing-80 $spacing-56;
        .crop-popup-text { @include text-body; line-height: 1.6; max-width: 1600px; }
        .bouton { position: absolute; right: -56px; bottom: -56px; }
      }
    }
  }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0px 1.62px 49.9px 53.92px rgba(255, 255, 255, 0.25); transform: translate(-50%, -50%) scale(1); }
  50% { box-shadow: 0px 1.62px 49.9px 65px rgba(255, 255, 255, 0.35); transform: translate(-50%, -50%) scale(1.02); }
}
</style>