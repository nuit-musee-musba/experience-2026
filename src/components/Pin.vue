<template>
  <div 
    class="pin" 
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @click="$emit('click')"
  >
    📍 {{ label }}
  </div>
</template>

<script setup>
const props = defineProps({
  position: Object,
  label: String
})
</script>

<style scoped>
.pin {
  position: absolute;
  cursor: pointer;
  font-size: 20px;
  user-select: none;
}
</style>
