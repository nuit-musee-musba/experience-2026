
<script setup>
import {useRoute} from "vue-router";
import { allData } from '@/store.js';
import { computed } from 'vue';
import LocationVueFrame from "@/components/layouts/LocationVueFrame.vue";
import IconPin from "@/components/icons/IconPin.vue";
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

const city = computed(() => {
  if (allData.value) {
    const laVille = allData.value.find( ville => ville.slug === route.params.citySlug );
    return laVille;
  }
})


</script>

<template>

  <Transition name="fade" mode="out-in" appear>
    <LocationVueFrame :hide-nav="!!route.params.artworkSlug">

    <div class="location-detail-box" v-if="museum">
      <section class="content-section">
      <div class="location-container location-infos">
        <div class="title-and-location">
          <p :key="city.slug">{{ city.name }}</p>
          <h2 class="title" :key="museum.slug">{{ museum.name }}</h2>
        </div>
      </div>
        <div class="location-container location-description-container">
          <div class="scroll-content">
            <div class="location-main-image"></div>
            <div class="scroll-content-box">
              <p :key="museum.slug">{{ museum.description }}</p>
              <h3 class="locations-artworks-section-title">Découvrez les oeuvres de ce lieu</h3>
              <div class="location-artworks-listing">
              <RouterLink class="artworks-item" @click.stop :to="`/${route.params.citySlug}/${museum.slug}/${artwork.slug}`" v-for="artwork in museum.artworks " :key="artwork.slug">
                <div class="artworks-item-image">

                </div>
                <p>{{ artwork.name }}</p>
              </RouterLink>
              </div>

              <router-view />
            </div>

          </div>
        </div>
      </section>
    </div>
      </LocationVueFrame>
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

.locations-artworks-section-title {
  @include text-body;
  font-size: 56px;
}

.location-main-image {
  background: gray;
  width: 100%;
  height: 800px;
}

.location-detail-box {
  height: 100%;
  display: flex;

  @include text-body;

  .image-section {
    width: 75%;
    height: 100%;
    padding: calc($spacing-96 - $border-width) $spacing-136 $spacing-32 calc($spacing-96 - $border-width);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;

    &::before {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      right: 0px; // -52 - 5 (border)
      width: calc($spacing-56 - $border-width); // 52px border - 5px border
      height: 100%;
      background-color: $blue-300;
    }

    &::after {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      right: -$border-width; // -52 - 5 (border)
      width: $border-width;
      height: 100%;
      background-color: $black;
    }

    .image-container {
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      background-color: $gray-200;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }

    .figcaption {
      font-size: $spacing-24;
      line-height: 1.3;
      margin-top: $spacing-10;
      text-align: right;
    }

    .button-container {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      margin-top: $spacing-74;
    }
  }

  .content-section {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;

    .location-container {
      box-sizing: border-box;
      padding: $spacing-80 $spacing-96;
      min-height: 0;

      .title-and-location {
        display: flex;
        flex-direction: column;
        gap: $spacing-16;
      }
    }

    .location-infos {
      border-bottom: 8px solid $black;

      &::-webkit-scrollbar {
        width: $spacing-24;
      }

      &::-webkit-scrollbar-thumb {
        background-color: $black;
      }

      display: flex;
      flex-direction: column;
      gap: $spacing-48;

      .title {
        font-family: $font-family-headings;
        line-height: 100%;
      }
    }

    .location-artworks-listing {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 44px;

      .artworks-item {
        text-decoration: none;
        @include text-body;
        font-size: 40px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        width: 480px;
      }

      .artworks-item-image {
        width: 480px;
        height: 418px;
        background: gray;
      }
    }


  }

  .location-description-container {
    flex: 1;
    overflow: hidden;
    min-height: 0;
    position: relative;
    padding: 0 !important;

    &::before {
      content: '';
      display: block;
      position: absolute;
      bottom: 0;
      left: $border-width;
      width: calc(100% - (#{$spacing-24} + #{$spacing-10})); // 5px margins left - 29px scrollbar
      height: 30%;
      background: linear-gradient(to top, $white 10%, transparent);
      z-index: 1;
      pointer-events: none;
      display: none;
    }

    .scroll-content {
      height: 100%;
      overflow-y: auto;
      padding-bottom: 200px;

      .scroll-content-box {
        padding: $spacing-80 $spacing-96;
        display: flex;
        flex-direction: column;
        gap: $spacing-96;
      }

      .header {
        display: flex;
        flex-direction: column;
        gap: $spacing-24;
      }

      &::-webkit-scrollbar {
        width: $spacing-24;
      }

      &::-webkit-scrollbar-thumb {
        background-color: $black;
      }

      .location-place {
        display: flex;
        align-items: center;
        gap: $spacing-4;


        :deep(svg) {
          width: $spacing-56;
          height: $spacing-56;
        }
      }
    }
  }
}

</style>