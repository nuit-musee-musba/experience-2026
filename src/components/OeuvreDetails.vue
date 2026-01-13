<template>
  <div class="details">
    <button @click="$emit('close')">✕</button>
    <img :src="oeuvre.image" :alt="oeuvre.titre" />
    <h2>{{ oeuvre.titre }}</h2>
    <p><strong>Artiste :</strong> {{ oeuvre.artiste }}</p>
    <p><strong>Année :</strong> {{ oeuvre.annee }}</p>
    <p>{{ oeuvre.description }}</p>
  </div>
</template>

<script setup>
defineProps({
  oeuvre: Object
})
</script>
