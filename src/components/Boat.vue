<template>
  <div ref="boat" class="boat">🚤</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'

const props = defineProps({
  destination: String
})
const emit = defineEmits(['arrived'])
const boat = ref(null)

onMounted(() => {
  // Animation bateau vers la droite
  gsap.to(boat.value, {
    x: 600,
    duration: 5,
    onComplete: () => emit('arrived')
  })
})
</script>

<style scoped>
.boat {
  position: absolute;
  top: 400px;
  left: 0px;
  font-size: 24px;
}
</style>
