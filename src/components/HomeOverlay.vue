<template>
  <div class="home-overlay">

    <div class="background-layer">
      <img v-for="(image, index) in introImages" :key="index" :src="image" alt="Fresque Jean Dupas" class="bg-img"
        :class="[`bg-img-${index}`, { 'visible': startAnim }]" :style="{ '--anim-index': index }" />
    </div>

    <div class="top-logo-box" :class="{ 'visible': startAnim }">
      <span class="label-create">réalisé par</span>
      <img src="@/assets/img/logo-mmi.png" alt="Logo MMI Bordeaux" class="logo-img" />
    </div>

    <div class="intro-card">
      <div class="card-content">

        <h1 class="main-title" :class="{ 'visible': startAnim }">
          Les grands décors<br>de Jean Dupas
        </h1>

        <p class="description-text" ref="descriptionRef" :class="{ 'visible': startAnim }">
          La contribution de Jean Dupas au domaine artistique est plus vaste que
          ce que présente l'exposition. Découvrez davantage de son œuvre et de
          ses collaborations à travers notre carte interactive.
        </p>

        <div class="cta-container" :class="{ 'visible': startAnim }">
          <Button class="start-btn" color="place" text-content="Commencer" icon-secondary @click="$emit('start')">
            <template #icon-secondary>
              <IconArrowRight />
            </template>
          </Button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Button from '@/components/buttons/Button.vue';
import IconArrowRight from '@/components/icons/IconArrowRight.vue';
import { useSplitText } from '../composables/useSplitText.js';

import intro1 from '@/assets/img/intro/intro1.webp';
import intro2 from '@/assets/img/intro/intro2.webp';
import intro3 from '@/assets/img/intro/intro3.webp';
import intro4 from '@/assets/img/intro/intro4.webp';
import intro5 from '@/assets/img/intro/intro5.webp';

const introImages = [intro1, intro2, intro3, intro4, intro5];
const descriptionRef = ref(null);
const startAnim = ref(false);

useSplitText(descriptionRef);

onMounted(() => {
  setTimeout(() => {
    startAnim.value = true;
  }, 100);
});
</script>

<style scoped lang="scss">
@use "@/styles/variables" as *;
@use "@/styles/colors" as *;
@use "@/styles/utils" as *;
@use "@/styles/typography" as *;
@use "@/styles/easings" as *;

.home-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: rgba(#DCDCDC, 0.8);
}

.background-layer {
  .bg-img {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: auto;

    display: block;
    object-fit: cover;
    object-position: bottom;

    z-index: 0;
    user-select: none;
    pointer-events: none;

    opacity: 0;
    transform: translateY(20px);
    transition: opacity 1s calc(var(--anim-index) * 0.08s) $ease-out-quint,
      transform 1s calc(var(--anim-index) * 0.08s) $ease-out-quint;

    &.visible {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .bg-img-0 {
    width: 1510px;
    bottom: 0;
    left: 0;
    z-index: 6;
  }

  .bg-img-1 {
    width: 1300px;
    bottom: 0;
    left: 200px;
    z-index: 9;
  }

  .bg-img-3 {
    width: 1500px;
    bottom: 0;
    right: 400px;
    left: 2210px;
    z-index: 8;
  }

  .bg-img-4 {
    width: 1100px;
    bottom: 0;
    right: 0;
    z-index: 3;
  }

  .bg-img-2 {
    width: 2000px;
    bottom: 0;
    right: 400px;
    left: 900px;
    z-index: 8;
  }
}

.top-logo-box {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;

  background-color: $white;
  @include border-5;

  padding: $spacing-32 $spacing-40;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-8;

  opacity: 0;
  transform: translateY(-20px);
  transition: all 1s $ease-out-quint;
  transition-delay: 0.5s;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .label-create {
    font-family: $font-family-sans-serif;
    font-size: 24px;
    font-weight: 400;
    color: $black;
    width: 100%;
    text-align: left;
  }

  .logo-img {
    height: 100px;
    width: auto;
    display: block;
  }
}

.intro-card {
  position: relative;
  z-index: 5;
  background-color: $white;
  pointer-events: all;
  user-select: auto;

  @include border-5;

  width: 60vw;
  max-width: 2200px;
  padding: $spacing-80;

  @media (max-width: 1024px) {
    width: 85vw;
    padding: $spacing-40;
  }
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-40;
  text-align: left;
}

.main-title {
  @include title-h1;
  color: $black;
  margin: 0;
  word-break: normal;
  line-height: 1.2;

  opacity: 0;
  transform: translateY(20px);
  transition: all 1s $ease-out-quint;
  transition-delay: 0.2s;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
}

.description-text {
  @include text-body;
  color: $black;
  max-width: 90%;
  margin-top: $spacing-16;

  :deep(.line) {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 1s calc(0.4s + var(--line-index) * 0.05s) $ease-out-quint,
      transform 1s calc(0.4s + var(--line-index) * 0.05s) $ease-out-quint;
    display: block;
  }

  &.visible {
    :deep(.line) {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.cta-container {
  margin-top: $spacing-32;
  display: flex;
  justify-content: flex-start;

  opacity: 0;
  transform: translateY(20px);
  transition: all 1s $ease-out-quint;
  transition-delay: 0.4s;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.btn__icon svg) {
  width: 32px;
  height: 32px;
}
</style>