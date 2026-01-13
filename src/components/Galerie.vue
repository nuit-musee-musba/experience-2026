<template>
  <div class="galerie">
    <OeuvreCard
      v-for="oeuvre in oeuvres"
      :key="oeuvre.id"
      :oeuvre="oeuvre"
      @select="oeuvreSelectionnee = $event"
    />

    <OeuvreDetails
      v-if="oeuvreSelectionnee"
      :oeuvre="oeuvreSelectionnee"
      @close="oeuvreSelectionnee = null"
    />
  </div>
</template>

<script setup>
import { ref } from "vue"
import { oeuvres } from "@/content/oeuvres"
import OeuvreCard from "@/components/OeuvreCard.vue"
import OeuvreDetails from "@/components/OeuvreDetails.vue"

const oeuvreSelectionnee = ref(null)
</script>
