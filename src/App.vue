<template>
  <div id="app">
    <MapScreen 
      :country="currentCountry"
      @go-to-country="goToCountry"
      @go-to-monument="goToMonument"
      @show-credits="showCredits = true"
    />
    <Credits v-if="showCredits" @close="showCredits = false" />
      <IdleScreen>
        <h1>Contenu de l’expérience</h1>
      </IdleScreen>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MapScreen from './components/MapScreen.vue'
import Credits from './components/Credits.vue'
import IdleScreen from "@/components/IdleScreen.vue";

const currentCountry = ref('France')
const showCredits = ref(false)

function goToCountry(country) {
  currentCountry.value = country
}

function goToMonument(monument) {
  alert(`Redirection vers le monument: ${monument}`)
}
</script>

<template>
  <router-view />
</template>

<style scoped>

</style>
