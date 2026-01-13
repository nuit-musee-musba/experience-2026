<script setup>
import ImmersiveGallery from './components/ImmersiveGallery.vue'
</script>

<template>
  <ImmersiveGallery />
</template>

<style>
/* On s'assure que rien ne gêne l'affichage */
body, html {
  margin: 0;
  padding: 0;
  overflow: hidden; /* Important pour éviter les doubles barres de scroll */
}
</style>