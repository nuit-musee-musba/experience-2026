<script setup>
const credits = [
  "Noé ARIES",
  "Adèle BEAUNÉ",
  "Kilian BENEY",
  "Bastien BETAT",
  "Gabriel BISSON--BARRET",
  "Brice BREART",
  "Line CABARET",
  "Elyser CELLIER",
  "Antoine COURCAUD",
  "Simon DAGUET--KARGL",
  "Adrian DELGADO",
  "Mathis DUMON",
  "Bartholomé DUTEIL",
  "Eva GARBUÏO--BINAUD",
  "Justine GELIS",
  "Roxane HORCHOWER",
  "Naïka JAN",
  "Alexis JUHEL",
  "Lucas JUILLAT",
  "Noah LABORDE",
  "Léa LAFAYE",
  "Louis LE DOUSSAL",
  "Lucas LE GOFF",
  "Antoine LE GUENIC",
  "Agathe LEBLANC",
  "Tya-Maëva MAZIERE--HADAJI",
  "Aurore MENN",
  "Thomas MERLAUD",
  "Maxence MINGASSON",
  "Dang-Thien-Phuc NGUYEN",
  "Noémie NUNEZ",
  "Hugo PINCHEMEL",
  "Edgar QUEMERE",
  "Dina RAKOTONARIVO",
  "Thomas RIQUIER",
  "Camille SURGET",
  "Gabriel VALTON",
  "Nathan VANDAELE",
  "Esthebann VOLLÉ",
  "Gwenaëlle YAU CHUN WAN"
];
</script>

<template>
  <div class="credits-container">
    <h3>Crédits</h3>
    <ul>
      <li v-for="(person, index) in credits" :key="index">
        {{ person }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.credits-container {
  padding: 20px;
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

li:last-child {
  border-bottom: none;
}
</style>