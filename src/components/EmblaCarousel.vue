<script setup>
import { ref } from 'vue'
import emblaCarouselVue from 'embla-carousel-vue'

// --- 1. ON DÉFINIT LES PROPS (Les ingrédients reçus du parent) ---
const props = defineProps({
  images: {
    type: Array,
    default: () => [] // Si on oublie de donner des images, ça ne plante pas
  }
})

// --- CONFIGURATION ---
const options = { loop: true, align: 'center' }
const [emblaRef, emblaApi] = emblaCarouselVue(options)
const emblaWrapperRef = ref(null)

// --- NAVIGATION ---
const scrollPrev = () => emblaApi.value && emblaApi.value.scrollPrev()
const scrollNext = () => emblaApi.value && emblaApi.value.scrollNext()

// --- PLEIN ÉCRAN ---
const toggleFullscreen = () => {
  const elem = emblaWrapperRef.value
  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch(err => console.log(err))
  } else {
    document.exitFullscreen()
  }
}
</script>

<template>
  <div class="embla-wrapper" ref="emblaWrapperRef">

    <div class="embla" ref="emblaRef">
      <div class="embla__container">
        <div class="embla__slide" v-for="(imgUrl, index) in props.images" :key="index">

          <div
              class="slide-background-blur"
              :style="{ backgroundImage: `url(${imgUrl})` }"
          ></div>

          <img class="slide-image-main" :src="imgUrl" alt="Carrousel image" />

        </div>
      </div>
    </div>

    <button class="nav-button nav-prev" @click="scrollPrev">
      <svg viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
    </button>
    <button class="nav-button nav-next" @click="scrollNext">
      <svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
    </button>
    <button class="fullscreen-btn" @click="toggleFullscreen">⛶ Plein écran</button>

  </div>
</template>

<style scoped>
/* --- Copie exactement le même CSS que précédemment ici --- */
/* Je te remets l'essentiel pour que ça marche direct */

.embla-wrapper {
  position: relative;
  width: 100%;
  height: 500px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}
.embla-wrapper:fullscreen {
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.embla, .embla__container { width: 100%; height: 100%; }
.embla__container { display: flex; }
.embla__slide {
  flex: 0 0 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.slide-background-blur {
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  background-size: cover;
  background-position: center;
  filter: blur(25px) brightness(0.5);
  transform: scale(1.1);
  z-index: 1;
}
.slide-image-main {
  position: relative;
  z-index: 2;
  height: 100%;
  width: auto;
  object-fit: contain;
  box-shadow: 0 0 30px rgba(0,0,0,0.7);
}
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.nav-button:hover { background: rgba(255, 255, 255, 1); color: #000; scale: 1.1; }
.nav-prev { left: 15px; }
.nav-next { right: 15px; }
.fullscreen-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 20;
  background: #d4e157;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
.fullscreen-btn:hover { transform: scale(1.05); background: #e6ee9c; }
</style>