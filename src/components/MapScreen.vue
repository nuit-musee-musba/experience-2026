<template>
  <div class="map-screen">
    <button class="icon-map" @click="goBackToMap">🗺️</button>

    <div class="carousel-wrapper">
      <EmblaCarousel :images="mesPhotos" />
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Imports en attente
// import { gsap } from 'gsap'
// import Pin from './Pin.vue'
// import Boat from './Boat.vue'
// import NavigationArrows from './NavigationArrows.vue'
// import CharacterDupas from './CharacterDupas.vue'

import EmblaCarousel from './EmblaCarousel.vue'

// Tes images
const mesPhotos = ref([
  'https://picsum.photos/id/1015/600/400',
  'https://picsum.photos/id/1039/600/800',
  'https://picsum.photos/id/1043/800/600'
])

const props = defineProps({
  country: String
})
const emit = defineEmits(['go-to-country', 'go-to-monument', 'show-credits'])

const selectedMonuments = ref([])
const showBoat = ref(false)
const boatDestination = ref('New York')

const pins = computed(() => {
  return []
})

const ships = ref([])
const arrows = ref([])

function handlePinClick(pin) {
  // if (pin.monuments) {
  //   gsap.to('.map-screen', { scale: 2 ... })
  //   selectedMonuments.value = pin.monuments
  // } else {
  //   emit('go-to-monument', pin.name)
  // }
}

function navigateTo(target) {
  console.log(`Navigation vers ${target}`)
}

function goBackToMap() {
  selectedMonuments.value = []
  emit('go-to-country', props.country)
}

function speakText() {
  console.log("Dupas explique le texte d'accueil")
}

function handleBoatArrived() {
  emit('go-to-country', 'USA')
}
</script>

<style scoped>
.map-screen {
  width: 100%;
  height: 100vh;
  position: relative;
  background-color: #add8e6;
  /* background: url('/assets/map-placeholder.png') no-repeat center center; */
  /* background-size: cover; */
  transform-origin: top left;
  overflow: hidden;
}

.icon-map {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 24px;
  cursor: pointer;
  z-index: 100;
  background: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.carousel-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 800px;
  z-index: 50;
}
</style>