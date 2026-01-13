<template>
  <div class="slider-wrapper">
    <div class="backdrop"></div>

    <div class="slides-container">
      <div 
        v-for="(slide, index) in slides" 
        :key="index"
        class="slide"
        :class="{ 
          'is-active': index === currentIndex,
          'is-discarded': index < currentIndex,
          'is-upcoming': index > currentIndex
        }"
        :style="{ zIndex: getZIndex(index) }"
        ref="slideRefs"
      >
        <div class="slide-content">
          <div class="image-container">
            <img :src="slide.image" draggable="false" />
          </div>
        </div>
      </div>
    </div>

    <div class="controls">
      <button @click="prev" :disabled="currentIndex === 0" class="nav-btn">
        <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
      </button>
      <span class="counter">{{ currentIndex + 1 }} / {{ slides.length }}</span>
      <button @click="next" :disabled="currentIndex === slides.length - 1" class="nav-btn">
        <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import gsap from 'gsap'

const slides = ref([
  { image: '/images/basilique.jpg', rotation: -2 },
  { image: 'https://picsum.photos/900/600?random=2', rotation: 3 },
  { image: 'https://picsum.photos/900/600?random=3', rotation: -1 },
  { image: 'https://picsum.photos/900/600?random=4', rotation: 4 },
  { image: 'https://picsum.photos/900/600?random=5', rotation: -3 },
  { image: 'https://picsum.photos/900/600?random=6', rotation: 2 }
])

const currentIndex = ref(0)
const slideRefs = ref([])

const getZIndex = (index) => {
  if (index === currentIndex.value) return 100
  if (index < currentIndex.value) return 10 + index 
  return 50 - index 
}

onMounted(() => {
  slideRefs.value.forEach((el, i) => {
    gsap.set(el, { 
      rotation: slides.value[i].rotation,
      scale: i === 0 ? 1 : 0.95,
      x: 0, 
      y: 0 
    })
  })
})

const next = () => {
  if (currentIndex.value >= slides.value.length - 1) return

  const currentEl = slideRefs.value[currentIndex.value]
  
  gsap.set(currentEl, { zIndex: 200 })

  const corners = [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: 1 }
  ]
  
  const targetCorner = corners[currentIndex.value % 4]
  
  const xTarget = targetCorner.x * (window.innerWidth / 2 - 80) + (Math.random() * 40 - 20)
  const yTarget = targetCorner.y * (window.innerHeight / 2 - 80) + (Math.random() * 40 - 20)
  
  const rotationTarget = (Math.random() * 30 + 10) * (Math.random() > 0.5 ? 1 : -1)

  gsap.to(currentEl, {
    x: xTarget,
    y: yTarget,
    rotation: rotationTarget,
    scale: 0.65,
    duration: 1.1,
    ease: 'power3.out',
    force3D: true
  })

  currentIndex.value++
  
  const nextEl = slideRefs.value[currentIndex.value]
  gsap.to(nextEl, {
    scale: 1,
    x: 0,
    y: 0,
    rotation: slides.value[currentIndex.value].rotation,
    duration: 1,
    ease: 'power3.out',
    force3D: true
  })
}

const prev = () => {
  if (currentIndex.value <= 0) return

  const currentActiveEl = slideRefs.value[currentIndex.value]
  gsap.to(currentActiveEl, {
    scale: 0.95,
    duration: 0.5
  })

  currentIndex.value--

  const prevEl = slideRefs.value[currentIndex.value]
  
  gsap.set(prevEl, { zIndex: 200 })

  gsap.to(prevEl, {
    x: 0,
    y: 0,
    rotation: slides.value[currentIndex.value].rotation,
    scale: 1,
    duration: 1.1,
    ease: 'power3.inOut',
    force3D: true,
    onComplete: () => {
      gsap.set(prevEl, { zIndex: '' })
    }
  })
}
</script>

<style scoped lang="scss">
.slider-wrapper {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background-color: #1a1a1a;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: sans-serif;
}

.slides-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1200px; 
}

.slide {
  position: absolute;
  width: 800px; 
  height: 533px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-origin: center center;
  will-change: transform;
  backface-visibility: hidden;
  
  .image-container img {
    transition: filter 1s ease;
    backface-visibility: hidden;
  }

  &.is-discarded {
    .image-container img {
      filter: brightness(0.3) grayscale(0.4);
    }
  }

  @media (max-width: 1024px) {
    width: 600px;
    height: 400px;
  }

  @media (max-width: 768px) {
    width: 340px;
    height: 226px;
  }
}

.slide-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-container {
  width: 100%;
  height: 100%;
  box-shadow: 0 15px 50px rgba(0,0,0,0.6);
  transform: translateZ(0);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
  }
}

.controls {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 30px;
  z-index: 200;
  color: white;
  
  .nav-btn {
    background: transparent;
    border: 2px solid rgba(255, 255, 255, 0.4);
    color: inherit;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    
    &:hover:not(:disabled) {
      background: white;
      color: black;
      transform: scale(1.1);
      border-color: white;
    }
    
    &:disabled {
      opacity: 0.2;
      cursor: not-allowed;
      border-color: rgba(255, 255, 255, 0.1);
    }
  }
  
  .counter {
    font-size: 1.2rem;
    font-weight: bold;
    letter-spacing: 2px;
  }
}
</style>