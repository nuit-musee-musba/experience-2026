<template>
  <div class="map-screen">
    <button class="icon-map" @click="goBackToMap">🗺️</button>
    <CharacterDupas @speak="speakText" />

    <!-- Pins -->
    <Pin
      v-for="pin in pins"
      :key="pin.name"
      :position="pin.position"
      :label="pin.name"
      @click="handlePinClick(pin)"
    />

    <!-- Monuments après zoom -->
    <div 
      v-for="mon in selectedMonuments" 
      :key="mon" 
      class="monument"
    >
      🏛️ {{ mon }}
    </div>

    <!-- Paquebots flottants -->
    <div 
      v-for="ship in ships" 
      :key="ship.name" 
      class="ship" 
      :style="{ left: ship.position.x + 'px', top: ship.position.y + 'px' }"
      @click="goToMonument(ship.name)"
    >
      🚢 {{ ship.name }}
    </div>

    <!-- Bateau animé -->
    <Boat 
      v-if="showBoat"
      :destination="boatDestination"
      @arrived="handleBoatArrived"
    />

    <!-- Flèches de navigation -->
    <NavigationArrows
      v-if="arrows.length"
      :arrows="arrows"
      @navigate="navigateTo"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { gsap } from 'gsap'
import Pin from './Pin.vue'
import Boat from './Boat.vue'
import NavigationArrows from './NavigationArrows.vue'
import CharacterDupas from './CharacterDupas.vue'

const props = defineProps({
  country: String
})
const emit = defineEmits(['go-to-country', 'go-to-monument', 'show-credits'])

const selectedMonuments = ref([])
const showBoat = ref(false)
const boatDestination = ref('New York')

const pins = computed(() => {
  if (props.country === 'France') {
    return [
      { name: 'Paris', position: { x: 100, y: 100 }, monuments: ['Tour Eiffel', 'Louvre', 'Notre-Dame', 'Montmartre'] },
      { name: 'Bordeaux', position: { x: 300, y: 200 } },
      { name: 'Libourne', position: { x: 400, y: 300 } }
    ]
  } else if (props.country === 'USA') {
    return [
      { name: 'New York', position: { x: 150, y: 120 } },
      { name: 'Budapest', position: { x: 350, y: 200 } }
    ]
  }
  return []
})

const ships = ref([
  { name: 'Paquebot1', position: { x: 500, y: 400 } },
  { name: 'Paquebot2', position: { x: 600, y: 350 } }
])

const arrows = ref([
  { direction: 'right', target: 'Bordeaux' },
  { direction: 'left', target: 'Paris' }
])

function handlePinClick(pin) {
  if (pin.monuments) {
    // Zoom animation avec GSAP
    gsap.to('.map-screen', { scale: 2, x: -pin.position.x * 1.5, y: -pin.position.y * 1.5, duration: 1 })
    selectedMonuments.value = pin.monuments
  } else {
    emit('go-to-monument', pin.name)
  }
}

function navigateTo(target) {
  alert(`Navigation vers ${target}`)
}

function goBackToMap() {
  selectedMonuments.value = []
  gsap.to('.map-screen', { scale: 1, x: 0, y: 0, duration: 1 })
  emit('go-to-country', props.country)
}

function speakText() {
  alert("Dupas explique le texte d'accueil")
}

function handleBoatArrived() {
  emit('go-to-country', 'USA')
}
</script>

<style scoped>
.map-screen {
  width: 100%;
  height: 100%;
  position: relative;
  background: url('/assets/map-placeholder.png') no-repeat center center;
  background-size: cover;
  transform-origin: top left;
}

.icon-map {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 24px;
  cursor: pointer;
}

.monument {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 18px;
  background: rgba(255,255,255,0.8);
  padding: 4px 8px;
  border-radius: 4px;
}

.ship {
  position: absolute;
  cursor: pointer;
  font-size: 20px;
  user-select: none;
}
</style>
