<template>
  <div class="oeuvre-card" @click="$emit('select', oeuvre)">
    <img :src="oeuvre.image" :alt="oeuvre.titre" />
    <h3>{{ oeuvre.titre }}</h3>
    <p>{{ oeuvre.artiste }}</p>
  </div>
</template>

<script setup>
defineProps({
  oeuvre: Object
})
</script>

<style scoped>
.oeuvre-card {
  cursor: pointer;
}
</style>
